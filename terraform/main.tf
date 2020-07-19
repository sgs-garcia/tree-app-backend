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
