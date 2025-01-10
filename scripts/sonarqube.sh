# Configuration
SONAR_HOST_URL="https://sonarqube-developers.rootstrap.net"
SONAR_API_TOKEN="squ_21cf7e64993c3df2b83511539c16429a28ec1d17"
#!/bin/bash

#!/bin/bash

# Check if fzf is installed, and install it if it's missing
if ! command -v fzf &>/dev/null; then
  echo "fzf is not installed. Installing fzf via Homebrew..."

  # Check if Homebrew is installed
  if command -v brew &>/dev/null; then
    brew install fzf
  else
    echo "Homebrew is not installed. Please install Homebrew f irst: https://brew.sh/"
    exit 1
  fi
fi

### Step 1: Retrieve the project name ###
echo ""
read -p "Please enter the project name: " project_name

# Confirm the entered project name
if [[ -z "$project_name" ]]; then
  echo "No project name provided. Exiting."
  exit 1
fi

echo "You have entered project name: $project_name"

### Step 2: Retrieve and select Quality Profile ###
# Fetch the list of quality profiles
quality_profiles_response=$(curl -s -X GET "$SONAR_HOST_URL/api/qualityprofiles/search" \
  -H "Authorization: Bearer $SONAR_API_TOKEN")

# Check if the response contains any profiles
if ! echo "$quality_profiles_response" | grep -q '"profiles"'; then
  echo "Failed to retrieve quality profiles. Response:"
  echo "$quality_profiles_response"
  exit 1
fi

# Extract and display the names of the quality profiles using jq and fzf for selection
selected_quality_profile=$(echo "$quality_profiles_response" | jq -r '.profiles[] | "\(.languageName) (\(.name))"' | fzf --prompt="Select a quality profile: ")

# Check if a selection was made
if [[ -z "$selected_quality_profile" ]]; then
  echo "No selection made. Exiting."
  exit 1
fi

# Extract both key and language in a single query based on the fzf selection
profile_info=$(echo "$quality_profiles_response" | jq -r --arg selected "$selected_quality_profile" '.profiles[] | select("\(.languageName) (\(.name))" == $selected) | {key, language, name}')

# Extract key and language from the JSON result
selected_quality_profile_name=$(echo "$profile_info" | jq -r '.name')
selected_quality_profile_language=$(echo "$profile_info" | jq -r '.language')

# Display the selected quality profile
echo "You have selected Quality Profile: $selected_quality_profile"

### Step 3: Retrieve and select Quality Gate ###
# Fetch the list of quality gates
quality_gates_response=$(curl -s -X GET "$SONAR_HOST_URL/api/qualitygates/list" \
  -H "Authorization: Bearer $SONAR_API_TOKEN")

# Check if the response contains any quality gates
if ! echo "$quality_gates_response" | grep -q '"qualitygates"'; then
  echo "Failed to retrieve quality gates. Response:"
  echo "$quality_gates_response"
  exit 1
fi

# Extract and display the names of the quality gates using jq and fzf for selection
selected_quality_gate=$(echo "$quality_gates_response" | jq -r '.qualitygates[].name' | fzf --prompt="Select a quality gate: ")

# Check if a selection was made
if [[ -z "$selected_quality_gate" ]]; then
  echo "No selection made. Exiting."
  exit 1
fi

# Extract the ID of the selected quality gate for API usage
selected_quality_gate_name=$(echo "$quality_gates_response" | jq -r --arg selected "$selected_quality_gate" '.qualitygates[] | select(.name == $selected) | .name')

# Display the selected quality gate
echo "You have selected Quality Gate: $selected_quality_gate"

### Step 4: Show summary of selected fields ###
echo ""
echo "########################################"
echo "Project Name: $project_name"
echo "Quality Profile: $selected_quality_profile"
echo "Quality Profile Language: $selected_quality_profile_language"
echo "Quality Gate: $selected_quality_gate"
echo "########################################"
echo ""

# Confirm choices
read -p "Are you sure you want to proceed with these selections? (y/n): " confirmation

if [[ "$confirmation" != "y" ]]; then
  echo "Project creation canceled. Exiting."
  exit 1
fi

### Step 5: Create the project ###
create_project_response=$(curl -s -X POST "$SONAR_HOST_URL/api/projects/create" \
  -H "Authorization: Bearer $SONAR_API_TOKEN" \
  -d "name=$project_name&project=$project_name")

if echo "$create_project_response" | grep -q '"errors"'; then
  echo "Failed to create project. Response:"
  echo "$create_project_response"
  exit 1
else
  echo "Project $project_name created successfully."
fi

### Step 6: Associate the Quality Profile with the project ###
assign_quality_profile_response=$(curl -s -X POST "$SONAR_HOST_URL/api/qualityprofiles/add_project" \
  -H "Authorization: Bearer $SONAR_API_TOKEN" \
  -d "project=$project_name&qualityProfile=$selected_quality_profile_name&language=$selected_quality_profile_language")

if echo "$assign_quality_profile_response" | grep -q '"errors"'; then
  echo "Failed to assign quality profile. Response:"
  echo "$assign_quality_profile_response"
  exit 1
else
  echo "Quality Profile $selected_quality_profile (Language: $selected_quality_profile_language) assigned to project $project_name successfully."
fi

### Step 7: Assign the Quality Gate to the project ###
assign_quality_gate_response=$(curl -s -X POST "$SONAR_HOST_URL/api/qualitygates/select" \
  -H "Authorization: Bearer $SONAR_API_TOKEN" \
  -d "projectKey=$project_name&gateName=$selected_quality_gate_name")

if echo "$assign_quality_gate_response" | grep -q '"errors"'; then
  echo "Failed to assign quality gate. Response:"
  echo "$assign_quality_gate_response"
  exit 1
else
  echo "Quality Gate $selected_quality_gate assigned to project $project_name successfully."
fi

### Final Confirmation Echo ###
echo ""
echo "########################################"
echo "SUCCESS!"
echo "Project '$project_name' was created successfully."
echo "Quality Profile '$selected_quality_profile' (Language: $selected_quality_profile_language) and Quality Gate '$selected_quality_gate' have been assigned to the project."
echo "########################################"
echo ""
