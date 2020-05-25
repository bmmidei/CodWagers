# CodWagers
# Deploying to App Engine
* Clone this repo.
* Create a new file called `env_variables.yaml` with the following structure.
```
env_variables:
  COD_API_EMAIL: <fill in>
  COD_API_PW: <fill in>
  DISCORD_BOT_TOKEN: <fill in>
```

*Set up the gcloud sdk if you haven't already: https://cloud.google.com/sdk/install
* Run `gcloud app deploy app.yaml` to deploy the project
  * If you don't have this project as default, you can set the project flag explicitly:
   `gcloud app deploy --project PROJECT_ID app.yaml`

* You can view current instances if you've already deployed with `gcloud app instances list`
