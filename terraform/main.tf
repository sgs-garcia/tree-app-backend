provider "google" {
  version = "~> 3.26"
  project = var.project
  region  = var.region
}

provider "google-beta" {
  version = "~> 3.30"
  project = var.project
  region  = var.region
}

terraform {
  backend "remote" {
    hostname = "app.terraform.io"
    organization = "serchtul"

    workspaces {
      name = "tree-app-backend"
    }
  }
}

resource "google_project" "treeapp" {
  provider   = google-beta

  project_id = var.project
  name       = var.project_name
}

resource "google_firebase_project" "default" {
  provider = google-beta

  project  = google_project.treeapp.project_id
}
