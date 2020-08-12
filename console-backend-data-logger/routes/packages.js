/*-------------------------------------------------------------------------------
* Name:        packages.js
* Purpose:     Route for POST /packages API
*
* Author:      PNDA Team
* Created:     2016/02/01
* History:     2016/02/01 - Initial commit
*
* Copyright (c) 2016 Cisco and/or its affiliates.
*
* This software is licensed to you under the terms of the Apache License,
* Version 2.0 (the "License").  You may obtain a copy of the License at
* http://www.apache.org/licenses/LICENSE-2.0
*
* The code, technical concepts, and all information contained herein, are the
* property of Cisco Technology, Inc. and/or its affiliated entities, under
* various laws including copyright, international treaties, patent, and/or
* contract. Any use of the material herein must be in accordance with the terms
* of the License. All rights not expressly granted by the License are reserved.
*
* Unless required by applicable law or agreed to separately in writing,
* software distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*-------------------------------------------------------------------------------*/

module.exports = function(express, async, logger, dbManager, cors, corsOptions){

  var router = express.Router();

  /* POST new package. */
  router.post('/', cors(corsOptions), function(req, res) {
    if (req.body) {
      async.each(req.body.data, function(item, callback) {
        if ((item.id !== null) && (item.id !== "")) {
          dbManager.create('package:' + item.id, item, 'platform-console-backend-package-update', function(error) {
            callback(error);
          });
        } else {
          // problem with the data we received in the create request - so flag an error for now
          callback('Error - missing required data in package body...');
        }
      }, function(err) {
        if (err === null) {
          logger.debug("Logged new package data okay");
          res.sendStatus(200);
        } else {
          logger.error("Failed to log new package data: " + err);
          res.sendStatus(500);
        }
      });
    } else {
      logger.error("Missing required package params");
      res.sendStatus(400);
    }

  });

  return router;

};
