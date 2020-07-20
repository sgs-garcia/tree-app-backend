resource "google_firebase_web_app" "basic" {
  provider = google-beta

  project      = var.project
  display_name = "Family Tree App"
}

data "google_firebase_web_app_config" "basic" {
  provider   = google-beta
  web_app_id = google_firebase_web_app.basic.app_id
}
