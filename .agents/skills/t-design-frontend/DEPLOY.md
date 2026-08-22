<!-- .agents/skills/t-design-frontend/DEPLOY.md -->
# t-design-frontend — deploying a brand change

Scope: **Cecy may deploy the DEV environment of the JJM Cell herself.**
Test and prod deploys, the MedApp Cell, and anything that fails preflight are
a **handoff to T** — no exceptions. There is no CD pipeline yet; deploys are
the manual runbook below (source of truth:
`infra/docs/dev-first-apply-checklist.md`).

Brand config is baked into the **backend image** (loaded at boot), so a
`brands/` change reaches the deployed app only through an image build +
Cloud Run roll. A marketing `tenant-config.ts` change ships with the
marketing app, which has **no provisioned deploy target yet → always
handoff**.

## 0 · Preflight — all must pass, else STOP and hand off

```bash
# a) Branch is pushed, gate is green on the branch (Cecy ran §Git already).
make gate

# b) The backend image actually bundles brands/ — known gap (report
#    Ph2_DevSecOps-report-after-s8.md, B1). If this grep finds nothing,
#    the image will crash at boot: STOP, hand off to T.
grep -rn "brands" backend/Dockerfile || echo "STOP: brands/ not in image"

# c) You are deploying the brand you changed, to DEV only.
bash .agents/skills/t-design-frontend/scripts/check_design_scope.sh

# d) gcloud is authenticated to the JJM dev project.
gcloud config get-value project    # expect: jjm-dev-497111
```

## 1 · Build and push the backend image (dev, JJM Cell)

```bash
export IMAGE_TAG=$(git rev-parse --short HEAD)
REPO="europe-west2-docker.pkg.dev/jjm-dev-497111/jjm-backend"

gcloud auth configure-docker europe-west2-docker.pkg.dev
cd backend
docker build -t "${REPO}/jjm-api:${IMAGE_TAG}" .
docker push     "${REPO}/jjm-api:${IMAGE_TAG}"
cd -
```

Teach: the tag is the git short SHA — the deploy is traceable to the exact
commit, and rolling back is "apply the previous tag", not a code change.

## 2 · Roll Cloud Run to the new image (dev only)

```bash
cd infra/environments/client-app
terraform init -backend-config=backend/dev.hcl   # first time per machine
terraform plan  -var-file=tfvars/jujitsu-movement-dev.tfvars \
  -var="container_image_tag=${IMAGE_TAG}"
# READ the plan. Expected: ONLY the Cloud Run service image changes.
# Any other resource changing = STOP, hand off to T with the plan output.
terraform apply -var-file=tfvars/jujitsu-movement-dev.tfvars \
  -var="container_image_tag=${IMAGE_TAG}"
cd -
```

Brand-config changes never require DB migrations. If anything mentions
`alembic`/migrations, that change was not a design change — stop.

## 3 · Post-deploy smoke — prove it, don't assume it

```bash
# Service healthy?
curl -s https://<jjm-api-dev-url>/health/ready

# Does the deployed manifest show the change? Log in on the dev web app,
# or fetch the manifest with a dev token and check navigation[] / theme.
```

Then check **one screen of an unchanged surface** too (cross-check the
regression hasn't shipped). Record what was deployed (tag, brand, change,
smoke result) in one line for T.

## Handoff template (test/prod/MedApp/marketing or failed preflight)

> **Deploy request** — branch `design-<brand>_<slug>` (pushed, gate green).
> Change: <one sentence>. Verified locally: <what you checked>.
> Needs: <env> deploy of <backend image | marketing app>.
> Blockers seen: <none | preflight step X failed: output>.
