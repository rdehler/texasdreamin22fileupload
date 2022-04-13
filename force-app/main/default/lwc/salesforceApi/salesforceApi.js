//import { LightningElement } from 'lwc';

export default class SalesforceApi {

  constructor(baseUrl, apiVersion, sessionId) {
    this.baseUrl = baseUrl;
    this.apiVersion = apiVersion || 'v46.0';
    this.sessionId = sessionId;
  }

  // Local utility to create a random string for multipart boundary
  randomString() {
    'use strict';
    var str = '',
      i;
    for (i = 0; i < 4; i += 1) {
      str += (Math.random().toString(16) + "000000000").substr(2, 8);
    }
    return str;
  }

  /* Low level function to create/update records with blob data
   * @param path resource path relative to /services/data
   * @param fields an object containing initial field names and values for
   *               the record, e.g. {ContentDocumentId: "069D00000000so2",
   *               PathOnClient: "Q1 Sales Brochure.pdf"}
   * @param filename filename for blob data; e.g. "Q1 Sales Brochure.pdf"
   * @param payloadField 'VersionData' for ContentVersion, 'Body' for Document
   * @param payload Blob, File, ArrayBuffer (Typed Array), or String payload
   * @param callback function to which response will be passed
   * @param [error=null] function to which response will be passed in case of error
   */
  blob(path, fields, filename, payloadField, payload, callback, error) {
    //'use strict';
    var that = this,
      url = this.baseUrl + '/services/data/' + this.apiVersion + path,
      boundary = this.randomString(),
      blob = new Blob([
        "--boundary_" + boundary + "\n" +
        "Content-Disposition: form-data; name=\"entity_content\";" + "\n" +
        "Content-Type: application/json" + "\n\n" +
        JSON.stringify(fields) +
        "\n\n" +
        "--boundary_" + boundary + "\n" +
        "Content-Type: application/octet-stream" + "\n" +
        "Content-Disposition: form-data; name=\"" + payloadField +
        "\"; filename=\"" + filename + "\"\n\n",
        payload,
        "\n\n" +
        "--boundary_" + boundary + "--"
      ]),
      request = new XMLHttpRequest();

    request.open("POST", url, true);

    request.setRequestHeader('Accept', 'application/json');
    request.setRequestHeader('Authorization', "Bearer " + this.sessionId);
    request.setRequestHeader('Content-Type', 'multipart/form-data; boundary=\"boundary_' + boundary + '\"');

    request.onreadystatechange = function () {
      // continue if the process is completed
      if (request.readyState === 4) {
        // continue only if HTTP status is good
        if (request.status >= 200 && request.status < 300) {
          // retrieve the response
          callback(request.response ? JSON.parse(request.response) : null);
        } else {
          // return status message
          error(request, request.statusText, request.response);
        }
      }
    };

    request.send(blob);
  }

  /*
   * Create a record with blob data
   * @param objtype object type; e.g. "ContentVersion"
   * @param fields an object containing initial field names and values for
   *               the record, e.g. {ContentDocumentId: "069D00000000so2",
   *               PathOnClient: "Q1 Sales Brochure.pdf"}
   * @param filename filename for blob data; e.g. "Q1 Sales Brochure.pdf"
   * @param payloadField 'VersionData' for ContentVersion, 'Body' for Document
   * @param payload Blob, File, ArrayBuffer (Typed Array), or String payload
   * @param callback function to which response will be passed
   * @param [error=null] function to which response will be passed in case of error
   */
  createBlob(objtype, fields, filename, payloadField, payload, callback, error) {
    'use strict';
    return this.blob('/sobjects/' + objtype + '/', fields, filename,
      payloadField, payload, callback, error);
  };

  /*
   * Update a record with blob data
   * @param objtype object type; e.g. "ContentVersion"
   * @param id the record's object ID
   * @param fields an object containing initial field names and values for
   *               the record, e.g. {ContentDocumentId: "069D00000000so2",
   *               PathOnClient: "Q1 Sales Brochure.pdf"}
   * @param filename filename for blob data; e.g. "Q1 Sales Brochure.pdf"
   * @param payloadField 'VersionData' for ContentVersion, 'Body' for Document
   * @param payload Blob, File, ArrayBuffer (Typed Array), or String payload
   * @param callback function to which response will be passed
   * @param [error=null] function to which response will be passed in case of error
   */
  updateBlob(objtype, id, fields, filename, payloadField, payload, callback, error) {
    'use strict';
    return this.blob('/sobjects/' + objtype + '/' + id + '?_HttpMethod=PATCH',
      fields, filename, payloadField, payload, callback, error);
  };

}
