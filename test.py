# What is a for loop and how does it work in Python?
for i in range(10):
    print(i)

# How do you define a function in Python?
def greet(name):
    print(f"Hello, {name}!")

greet("Alice")

# How do if-else statements work in Python?
x = 20
if x > 10:
    print("x is greater than 10")
else:
    print("x is 10 or less")

# How do you create and manipulate a list in Python?
fruits = ['apple', 'banana', 'cherry']
fruits.append('orange')
print(fruits)

# What is a class in Python and how do you define one?
class Dog:
    def __init__(self, name, breed):
        self.name = name
        self.breed = breed

    def bark(self):
        print(f"{self.name} says woof!")

dog1 = Dog("Buddy", "Golden Retriever")
dog1.bark()

# How do dictionaries work in Python, and how do you access values in them?
person = {"name": "John", "age": 30, "city": "New York"}
print(person["name"])
print(person["age"])