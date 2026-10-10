#!/bin/bash

set -eo pipefail

echo "===== Starting ci_setup.sh (GitHub Actions) ====="

# 1. Resolve repository root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
echo "Repository root: ${REPO_ROOT}"
cd "${REPO_ROOT}"

# 2. Write environment variables to .env
echo "===== Generating .env file ====="
ENV_FILE="${REPO_ROOT}/.env"

cat << EOF > "${ENV_FILE}"
ROLLBAR_API_KEY=${ROLLBAR_API_KEY}
GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
OPEN_ROUTES_SERVICE_API_KEY=${OPEN_ROUTES_SERVICE_API_KEY}
EOF

# Warn if critical keys are not set
if [[ -z "${ROLLBAR_API_KEY}" ]]; then
  echo "Warning: ROLLBAR_API_KEY is not defined in GitHub environment/secrets!" >&2
fi

# 3. Restore google-services.json if provided in secrets (raw JSON or base64)
if [[ -n "${GOOGLE_SERVICES_JSON}" ]]; then
  echo "Writing google-services.json from secret..."
  GOOGLE_SERVICES_DEST="${REPO_ROOT}/android/app/google-services.json"
  if echo "${GOOGLE_SERVICES_JSON}" | base64 --decode &>/dev/null && echo "${GOOGLE_SERVICES_JSON}" | base64 --decode | grep -q '"project_info"'; then
    echo "${GOOGLE_SERVICES_JSON}" | base64 --decode > "${GOOGLE_SERVICES_DEST}"
  else
    echo "${GOOGLE_SERVICES_JSON}" > "${GOOGLE_SERVICES_DEST}"
  fi
fi

# 4. Decode Android upload keystore if provided in secrets
if [[ -n "${ANDROID_KEYSTORE_BASE64}" ]]; then
  echo "Decoding Android keystore from secret..."
  KEYSTORE_PATH="${REPO_ROOT}/android/app/release.keystore"
  echo "${ANDROID_KEYSTORE_BASE64}" | base64 --decode > "${KEYSTORE_PATH}"
  echo "ANDROID_KEYSTORE_PATH=${KEYSTORE_PATH}" >> "${GITHUB_ENV:-/dev/null}"
  echo "BLOOMABLE_UPLOAD_STORE_FILE=${KEYSTORE_PATH}" >> "${GITHUB_ENV:-/dev/null}"
fi

# 5. Check and validate version format in package.json
VERSION=$(node -p "require('./package.json').version" 2>/dev/null || true)
echo "Detected package.json version: '${VERSION}'"

# 6. Verify required tools
for cmd in node yarn git; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: Required tool '$cmd' is not installed or not in PATH." >&2
    exit 1
  fi
done

echo "===== ci_setup.sh completed successfully ====="
