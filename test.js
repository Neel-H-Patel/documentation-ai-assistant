// Simple JavaScript code for testing
//?? Give me a simple .js file
// Log a message to the console
console.log("Hello, world!");

// Define a function that adds two numbers
function add(a, b) {
    return a + b;
}

// Call the function and log the result
let sum = add(5, 10);
console.log("The sum of 5 and 10 is:", sum);

// Create an array and manipulate it
let fruits = ["apple", "banana", "cherry"];
console.log("Original array:", fruits);

// Add a new element to the array
fruits.push("date");
console.log("Array after adding 'date':", fruits);

// Remove the first element from the array
let removedFruit = fruits.shift();
console.log("Removed element:", removedFruit);
console.log("Array after removing the first element:", fruits);

// Loop through the array and log each element
fruits.forEach((fruit, index) => {
    console.log(`Fruit ${index + 1}: ${fruit}`);
});