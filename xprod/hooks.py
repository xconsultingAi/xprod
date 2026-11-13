app_name = "xprod"
app_title = "xProd"
app_publisher = "Xconsol"
app_description = "Installable mobile app (PWA) for recording Expense and Income Journal Entries in ERPNext"
app_email = "xconsol.pk@gmail.com"
app_license = "agpl-3.0"

required_apps = ["erpnext"]

app_logo_url = "/assets/xprod/manifest/icon-192.png"
app_home = "/xprod"

add_to_apps_screen = [
	{
		"name": app_name,
		"logo": app_logo_url,
		"title": app_title,
		"route": app_home,
		"has_permission": "xprod.api.check_app_permission",
	}
]

# The Vue app handles its own routes under /xprod (e.g. /xprod/expense)
website_route_rules = [
	{"from_route": "/xprod/<path:app_path>", "to_route": "xprod"},
]
