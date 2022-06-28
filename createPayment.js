'use strict';
const AWS = require('aws-sdk');
const eventBridge = new AWS.EventBridge({apiVersion: '2015-10-07'})

module.exports.createPayment = async (event) => {
  const body = JSON.parse(event.body)
  await putEvents(body);
  return {statusCode: 201, messgae:"Payment created"}
};

module.exports.processVendorPayment = async (event) => {
    const body = event.detail
    const dynamoDb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'})
    const putParams = {
        TableName: "serverless-dev",
        Item: {
            paymentId: event.id,
            paymentSource: body.paymentSource,
            destination: body.destination,
            currency: body.currency,
            amount: body.amount,
            processedBy: "vendorHandler"
          }
    }
    await dynamoDb.put(putParams).promise()
    return {statusCode: 201, message: "Vendor payment stored successfully"}
  };
  
  module.exports.processClientPayment = async (event) => {
    const body = event.detail
    const dynamoDb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'})
    const putParams = {
        TableName: "serverless-dev",
        Item: {
            paymentId: event.id,
            paymentSource: body.paymentSource,
            destination: body.destination,
            currency: body.currency,
            amount: body.amount,
            processedBy: "clientHandler"
          }
    }
    await dynamoDb.put(putParams).promise()
    return {statusCode: 201, message: "Client payment stored successfully"}
  };

function putEvents(eventObject) {
    let params = {
        Entries: [{
            Detail: JSON.stringify(eventObject),
            DetailType: eventObject.paymentSource === "client" ? "client" : "vendor",
            Source: eventObject.paymentSource === "client" ? "client" : "orbital"
        }]
    }
    return eventBridge.putEvents(params).promise();
}