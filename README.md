To handle 10k+ concurrent request:
1. Rate limiter at API Gateway/ ALB and token based limit for authenticated users.
2. add Redis/ElsstiCache to store response of transcription retrieveal to navigate read heavy operations to cache. 
3. Add AWS SQS to process requests in queues instead of processing immediately.
4. Use to AWS Lambdas to auto scale the endpoints
5. using Mongodb read node to perform get operations
6. using cloudwatch to monitor logs and lambda errors
7. using proper DB index for fast data retrieval 