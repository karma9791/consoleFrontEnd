# Data Manager API

The platform-console-data-manager project contains a Node.js app that provides a number of services for the platform-console-frontend web app via a REST API interface. In many cases, the backend simply provides a wrapper for REST APIs from other services.

By default, the data manager runs on port 3123.

For an interactive Swagger API console, see __/docs__.

For some Frisby unit tests, see __/tests__.

* [Login API](#login-api)
  * [POST /pam/login](#login)
  * [POST /pam/logout](#logout)
* [Packages API](#packages-api)
  * [GET /api/dm/packages](#list-all-packages)
  * [GET /api/dm/packages/deployed](#list-deployed-packages)
  * [GET /api/dm/packages/_package_](#get-full-information-for-package)
  * [PUT /api/dm/packages/_package_](#deploy-package-to-the-cluster)
  * [DELETE /api/dm/packages/_package_](#undeploy-package-from-the-cluster)
* [Applications API](#applications-api)
  * [GET /api/dm/applications](#list-all-applications)
  * [POST /api/dm/applications/_application_/start](#start-application)
  * [POST /api/dm/applications/_application_/stop](#stop-application)
  * [GET /api/dm/applications/_application_](#get-full-information-for-application)
  * [PUT /api/dm/applications/_application_](#create-application-from-package)
  * [DELETE /api/dm/applications/_application_](#destroy-application)
* [Endpoints API](#environment-endpoints-api)
  * [GET /api/dm/endpoints](#list-environment-variables)
* [Datasets API](#datasets-api)
  * [GET /api/dm/datasets](#list-datasets)
  * [GET /api/dm/datasets/_datasets_](#get-dataset)
  * [PUT /api/dm/datasets/_datasets_](#update-dataset)
* [Metrics API](#metrics-api)
  * [GET /](#all-values)
  * [GET /api/dm/metrics](#list-metrics)
  * [PUT /api/dm/datasets/_datasets_](#get-metric)


## Login API

To access the Data manager API, you will need to login. The login API uses [PassPort authentication middleware for Nodejs](http://www.passportjs.org/) with [Asynchronous PAM authentication for NodeJS](https://www.npmjs.com/package/authenticate-pam) as the Custom strategy. Once logged in, this will create a PassPort session which is shared with Express session.

### Login
````
POST /pam/login

Headers: 'Content-Type': 'application/x-www-form-urlencoded'

Response Codes:
200 - OK
401 - Unauthorized
500 - Server Error

Example body:
username=pnda&password=cG5kYQ==
````
The password must be encoded in Base64

### Logout
````
GET /pam/logout

Response Codes:
200 - OK
500 - Server Error

Example body:
{"session":"logout"}
````

## Packages API

The packages API lets you see what software packages are available for deployment in the cluster. You can deploy packages, which turns them into applications.

### List all packages
````
GET /api/dm/packages

Response Codes:
200 - OK
500 - Server Error

Example response:
["spark-batch-example-app-1.0.23"]
````

### List deployed packages
````
GET /api/dm/packages/deployed

Response Codes:
200 - OK
500 - Server Error

Example response:
{"status": "DEPLOYED", "information": "human readable error message or other information about this status"}

Possible values for status:
NOTDEPLOYED
DEPLOYING
DEPLOYED
UNDEPLOYING
````

### Get full information for _package_
````
GET /api/dm/packages/<package>

Response Codes:
200 - OK
500 - Server Error

Example response:
{
	"status": "DEPLOYED",
	"version": "1.0.23",
	"name": "spark-batch-example-app",
	"user": "who-deployed-this",
	"defaults": {
		"oozie": {
			"example": {
				"end": "${deployment_end}",
				"start": "${deployment_start}",
				"driver_mem": "256M",
				"input_data": "/user/pnda/PNDA_datasets/datasets/source=test-src/year=*",
				"executors_num": "2",
				"executors_mem": "256M",
				"freq_in_mins": "180",
				"job_name": "batch_example"
			}
		}
	}
}
````

### Deploy _package_ to the cluster
````
PUT /api/dm/packages/<package>

Response Codes:
202 - Accepted, poll /packages/<package>/status for status
404 - Package not found in repository
409 - Package already deployed
500 - Server Error
````

### Undeploy _package_ from the cluster
````
DELETE /api/dm/packages/<package>

Response Codes:
202 - Accepted, poll /packages/<package>/status for status
404 - Package not deployed
500 - Server Error
````

## Applications API

The applications API lets you see what applications are available in the cluster. You can start, stop, and delete applications.

### List all applications
````
GET /api/dm/applications

Response Codes:
200 - OK
500 - Server Error

Example response:
["spark-batch-example-app-instance"]
````

### List applications that have been created from _package_
````
GET /api/dm/packages/<package>/applications

Response Codes:
200 - OK
500 - Server Error

Example response:
["spark-batch-example-app-instance"]
````

### Get the status for _application_
````
GET /api/dm/applications/<application>/status

Response Codes:
200 - OK
404 - Application not known
500 - Server Error

Example response:
{"status": "STARTED", "information": "human readible error message or other information about this status"}

Possible values for status:
NOTCREATED
CREATING
CREATED
STARTING
STARTED
STOPPING
DESTROYING
````

### Get run-time details for _application_
````
GET /api/dm/applications/<application>/detail

Response Codes:
200 - OK
404 - Application not known
500 - Server Error

{
        "status": "STARTED",
        "name": "application-name",
        "yarn-ids": [
            {"component":"example", "type":"oozie", "yarn-id":"application_1455877292606_0404"}
        ]
}
````

### Start _application_
````
POST /api/dm/applications/<application>/start

Response Codes:
202 - Accepted, poll /applications/<application>/status for status
404 - Application not known
500 - Server Error
````

### Stop _application_
````
POST /api/dm/applications/<application>/stop

Response Codes:
202 - Accepted, poll /applications/<application>/status for status
404 - Application not known
500 - Server Error
````

### Get full information for _application_
````
GET /api/dm/applications/<application>

Response Codes:
200 - OK
404 - Application not known
500 - Server Error

Example response:
{
	"status": "CREATED",
	"overrides": {
		"oozie": {
			"example": {
				"executors_num": "5"
			}
		}
	},
	"user": "somebody",
	"package_name": "spark-batch-example-app-1.0.23",
	"name": "spark-batch-example-app-instance",
	"defaults": {
		"oozie": {
			"example": {
				"end": "${deployment_end}",
				"input_data": "/user/pnda/PNDA_datasets/datasets/source=test-src/year=*",
				"driver_mem": "256M",
				"start": "${deployment_start}",
				"executors_num": "2",
				"freq_in_mins": "180",
				"executors_mem": "256M",
				"job_name": "batch_example"
			}
		}
	}
}
````

### Create _application_ from _package_

````
PUT /api/dm/applications/<application>
{
	"user": "<username>",
	"package": "<package>",
	"<componentType>": {
		"<componentName>": {
			"<property>": "<value>"
		}
	}
}

Response Codes:
202 - Accepted, poll /applications/<application>/status for status
400 - Request body failed validation
404 - Package not found
409 - Application already exists
500 - Server Error

Example body:
{
	"user": "somebody",
	"package": "<package>",
	"oozie": {
		"example": {
			"executors_num": "5"
		}
	}
}

Package and user are mandatory, property settings are optional
````

### Destroy _application_
````
DELETE /api/dm/applications/<application>

Response Codes:
200 - OK
404 - Application not known
500 - Server Error
````

## Endpoints API

The endpoints API lets you browse environment variables that are known to the deployment manager.

### List environment variables
````
GET /api/dm/endpoints

Response Codes:
200 - OK
500 - Server Error

Example response:
{"zookeeper_port": "2181", "cluster_root_user": "cloud-user", ... }
````

## Datasets API

The datasets API lets you browse and update data rention policies for datasets in the cluster.

### List datasets

Datasets have a data retention __policy__ which can be set to __age__ or __size__, which controls whether the dataset has a maximum age in days (__max_age_days__) or size (__max_size_gigabytes__).

Datasets have a data retention __mode__ which can be set to __archive__ or __delete__, which controls what happens to data when it has reached the maximum age or size.

````
GET /api/dm/datasets

Response Codes:
200 - OK
500 - Server Error

Example response:
[{"policy":"age","path":"/user/pnda/PNDA_datasets/datasets/source=netflow","max_age_days":30,"id":"netflow","mode":"archive"},{"policy":"size","path":"/user/pnda/PNDA_datasets/datasets/source=telemetry","max_size_gigabytes":10,"id":"telemetry","mode":"delete"}]
````

### Get dataset
````
GET /api/dm/datasets/<dataset>

Response Codes:
200 - OK
404 - Not found
500 - Server Error

Example response:
{"policy":"age","path":"/user/pnda/PNDA_datasets/datasets/source=netflow","max_age_days":30,"id":"netflow","mode":"archive"}
````

### Update dataset
````
PUT /api/dm/datasets/<dataset>

Response Codes:
200 - OK
404 - Not found
500 - Server Error

Example body:
{"mode":"archive"}
{"mode":"delete"}
{"policy":"age","max_age_days":30}
{"policy":"size","max_size_gigabytes":10}
````

## Metrics API

The metrics API lets you browse metrics available for the cluster.

### All values
````
GET /api/dm/

Response Codes:
200 - OK
500 - Server Error

Example response:
{
  "data": [
    "metric:zookeeper.nodes.ok",
    "kafka.brokers.1.controllerstats.LeaderElection.75thPercentile",
    "kafka.brokers.1.system.OpenFileDescriptorCount",
    "metric:kafka.brokers.1.controllerstats.LeaderElection.RateUnit",
    "kafka.brokers.1.UnderReplicatedPartitions",
    "metric:platform.deployment-manager.packages_deployed_succeeded",
    "kafka.brokers.1.controllerstats.UncleanLeaderElections.FifteenMinuteRate",
    "metric:kafka.brokers.1.system.FreePhysicalMemorySize",
    "hadoop.HDFS.total_dfs_capacity_across_datanodes",
    "kafka.nodes.ok",
		...
  ]
}
````

### List metrics
````
GET /api/dm/metrics

Response Codes:
200 - OK
500 - Server Error

Example response:
{
  "metrics": [
    "zookeeper.nodes.ok",
    "kafka.brokers.1.controllerstats.LeaderElection.RateUnit",
    "platform.deployment-manager.packages_deployed_succeeded",
    "kafka.brokers.1.system.FreePhysicalMemorySize"
  ]
}
````

### Get metric
````
GET /api/dm/metrics/<metric>

Response Codes:
200 - OK
404 - Not found
500 - Server Error

Example response:
{
  "metric": "kafka.health",
  "currentData": {
    "source": "kafka",
    "value": "OK",
    "timestamp": "1459438855068",
    "causes": ""
  }
}
````
