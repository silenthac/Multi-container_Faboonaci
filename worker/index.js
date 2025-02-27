const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});
const sub = redisClient.duplicate();

redisClient.on('connect', () => {
  console.log("Redis connected");
});

// Method 1: Using memoization (best for this use case)
const memo = {};
function fib(index) {
  // Input validation
  if (typeof index !== 'number' && typeof index !== 'string') {
    console.error('Invalid input type:', typeof index);
    return 0;
  }
  
  // Convert to number
  index = parseInt(index);
  
  // Validate parsed number
  if (isNaN(index) || index < 0) {
    console.error('Invalid index:', index);
    return 0;
  }
  
  // Base cases
  if (index < 2) return 1;
  
  // Check memo
  if (memo[index]) {
    console.log(`Using cached value for index ${index}`);
    return memo[index];
  }
  
  // Calculate new value
  console.log(`Calculating new value for index ${index}`);
  memo[index] = fib(index - 1) + fib(index - 2);
  return memo[index];
}

// Method 2: Iterative approach (alternative)
/*
function fib(index) {
  if (index < 2) return 1;
  
  index = parseInt(index);
  let prev = 1, curr = 1;
  
  for (let i = 2; i <= index; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  
  return curr;
}
*/

sub.on('message', (channel, message) => {
  redisClient.hset('values', message, fib(parseInt(message)));
});
sub.subscribe('insert');
