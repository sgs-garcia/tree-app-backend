resource "google_cloud_run_service" "treeapp" {
  name                       = var.service
  location                   = var.region
  autogenerate_revision_name = true

  template {
    spec {
      containers {
        image = "gcr.io/${var.project}/${var.service}:${var.revision}"
      }
    }
  }
}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "noauth" {
  location    = google_cloud_run_service.treeapp.location
  project     = google_cloud_run_service.treeapp.project
  service     = google_cloud_run_service.treeapp.name

  policy_data = data.google_iam_policy.noauth.policy_data
}