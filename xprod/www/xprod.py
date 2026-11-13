import frappe
from frappe import _

no_cache = 1


def get_context(context):
	if frappe.session.user == "Guest":
		frappe.local.flags.redirect_location = "/login?redirect-to=" + frappe.utils.quote(
			frappe.request.path if frappe.request else "/xprod"
		)
		raise frappe.Redirect

	if frappe.get_cached_value("User", frappe.session.user, "user_type") == "Website User":
		frappe.throw(_("You need a desk user account to use xProd."), frappe.PermissionError)

	context.csrf_token = frappe.sessions.get_csrf_token()
	frappe.db.commit()  # persist the new CSRF token on the session
	return context
