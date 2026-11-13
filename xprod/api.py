"""Server API for the xProd app: account lookups and Expense/Income Journal Entries."""

import frappe
from frappe import _
from frappe.utils import flt, getdate

ENTRY_KINDS = ("expense", "income")


def check_app_permission() -> bool:
	"""Show xProd on the apps screen to desk users who can create Journal Entries."""
	if frappe.session.user == "Administrator":
		return True
	if frappe.get_cached_value("User", frappe.session.user, "user_type") == "Website User":
		return False
	return bool(frappe.has_permission("Journal Entry", "create"))


@frappe.whitelist()
def get_boot() -> dict:
	"""Current user and the companies they may record entries for."""
	companies = frappe.get_list("Company", fields=["name", "default_currency"], order_by="name asc")
	names = [c.name for c in companies]
	default = frappe.defaults.get_user_default("Company")
	if default not in names:
		default = names[0] if names else None

	return {
		"user": frappe.session.user,
		"full_name": frappe.utils.get_fullname(frappe.session.user),
		"companies": companies,
		"default_company": default,
		"can_create": bool(frappe.has_permission("Journal Entry", "create")),
	}


@frappe.whitelist()
def get_accounts(company: str, account_kind: str) -> list[dict]:
	"""Leaf accounts of a company: 'expense', 'income' or 'cash' (Cash and Bank)."""
	filters = {"company": company, "is_group": 0, "disabled": 0}
	if account_kind == "expense":
		filters["root_type"] = "Expense"
	elif account_kind == "income":
		filters["root_type"] = "Income"
	elif account_kind == "cash":
		filters["account_type"] = ("in", ("Cash", "Bank"))
	else:
		frappe.throw(_("Unknown account kind: {0}").format(account_kind))

	return frappe.get_list(
		"Account",
		filters=filters,
		fields=["name", "account_name"],
		order_by="account_name asc",
		limit_page_length=0,
	)


@frappe.whitelist()
def get_cost_centers(company: str) -> list[str]:
	return frappe.get_list(
		"Cost Center",
		filters={"company": company, "is_group": 0, "disabled": 0},
		pluck="name",
		order_by="name asc",
		limit_page_length=0,
	)


@frappe.whitelist(methods=["POST"])
def create_entry(
	kind: str,
	company: str,
	posting_date: str,
	amount: float | str,
	account: str,
	cash_account: str,
	cost_center: str | None = None,
	remark: str | None = None,
) -> str:
	"""Create a draft Journal Entry for an expense or an income and return its name.

	Expense: debit the expense account, credit cash/bank.
	Income:  debit cash/bank, credit the income account.
	"""
	if kind not in ENTRY_KINDS:
		frappe.throw(_("Entry type must be expense or income."))

	amount = flt(amount, 2)
	if amount <= 0:
		frappe.throw(_("Amount must be greater than 0."))

	_validate_account(account, company, root_type="Expense" if kind == "expense" else "Income")
	_validate_account(cash_account, company, account_types=("Cash", "Bank"))
	if cost_center and frappe.db.get_value("Cost Center", cost_center, "company") != company:
		frappe.throw(_("Cost Center {0} does not belong to {1}.").format(cost_center, company))

	main_row = {"account": account}
	cash_row = {"account": cash_account}
	if cost_center:
		main_row["cost_center"] = cost_center

	if kind == "expense":
		main_row["debit_in_account_currency"] = amount
		cash_row["credit_in_account_currency"] = amount
		rows = [main_row, cash_row]
	else:
		cash_row["debit_in_account_currency"] = amount
		main_row["credit_in_account_currency"] = amount
		rows = [cash_row, main_row]

	je = frappe.get_doc(
		{
			"doctype": "Journal Entry",
			"voucher_type": "Journal Entry",
			"company": company,
			"posting_date": getdate(posting_date),
			"user_remark": (remark or "").strip(),
			"accounts": rows,
		}
	)
	je.insert()  # checks the user's create permission on Journal Entry
	return je.name


def _validate_account(account, company, root_type=None, account_types=None):
	details = frappe.db.get_value(
		"Account", account, ["company", "is_group", "root_type", "account_type"], as_dict=True
	)
	if not details or details.company != company or details.is_group:
		frappe.throw(_("Account {0} is not a ledger account of {1}.").format(account, company))
	if root_type and details.root_type != root_type:
		frappe.throw(_("Account {0} is not an {1} account.").format(account, root_type))
	if account_types and details.account_type not in account_types:
		frappe.throw(_("Account {0} is not a Cash or Bank account.").format(account))
