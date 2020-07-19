resource "google_firebase_project_location" "basic" {
  provider    = google-beta

  project     = google_firebase_project.default.project
  location_id = var.region
}

resource "google_firebase_web_app" "basic" {
  provider = google-beta

  project      = google_project.treeapp.project_id
  display_name = "Family Tree App"
  depends_on   = [google_firebase_project.default]
}

data "google_firebase_web_app_config" "basic" {
  provider   = google-beta
  web_app_id = google_firebase_web_app.basic.app_id
}
