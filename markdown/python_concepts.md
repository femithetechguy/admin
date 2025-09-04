# Python Concepts

## Basics

### Variables and Data Types
Python is dynamically typed, which means you don't need to declare variable types.

```python
# Integer
x = 10

# Float
y = 10.5

# String
name = "Python"

# Boolean
is_active = True

# List
my_list = [1, 2, 3, 4]

# Dictionary
my_dict = {"key": "value", "name": "Python"}

# Tuple (immutable)
my_tuple = (1, 2, 3)

# Set
my_set = {1, 2, 3, 4}
```

### Control Flow
```python
# If statement
if x > 5:
    print("x is greater than 5")
elif x == 5:
    print("x is equal to 5")
else:
    print("x is less than 5")

# For loop
for i in range(5):
    print(i)  # Prints 0, 1, 2, 3, 4

# While loop
count = 0
while count < 5:
    print(count)
    count += 1
```

## Functions

```python
# Basic function
def greet(name):
    return f"Hello, {name}!"

# Function with default parameter
def greet_with_default(name="Guest"):
    return f"Hello, {name}!"

# Lambda function (anonymous function)
square = lambda x: x * x
```

## Object-Oriented Programming

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
        
    def greet(self):
        return f"Hello, my name is {self.name} and I am {self.age} years old."
        
# Creating an instance
person = Person("Alice", 30)
print(person.greet())

# Inheritance
class Student(Person):
    def __init__(self, name, age, student_id):
        super().__init__(name, age)
        self.student_id = student_id
        
    def study(self):
        return f"{self.name} is studying."
```

## Exception Handling

```python
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero!")
except Exception as e:
    print(f"An error occurred: {e}")
finally:
    print("This will always execute.")
```

## Advanced Concepts

### List Comprehensions
```python
# Create a list of squares
squares = [x*x for x in range(10)]

# With condition
even_squares = [x*x for x in range(10) if x % 2 == 0]
```

### Generators
```python
def count_up_to(n):
    i = 0
    while i < n:
        yield i
        i += 1

for i in count_up_to(5):
    print(i)  # Prints 0, 1, 2, 3, 4
```

### Decorators
```python
def my_decorator(func):
    def wrapper():
        print("Something is happening before the function is called.")
        func()
        print("Something is happening after the function is called.")
    return wrapper

@my_decorator
def say_hello():
    print("Hello!")

say_hello()
```

### Context Managers
```python
# File handling using context manager
with open("file.txt", "r") as file:
    content = file.read()
    # File is automatically closed after the block
```

## Libraries and Modules

- **NumPy**: For numerical operations
- **Pandas**: For data manipulation and analysis
- **Matplotlib/Seaborn**: For data visualization
- **Requests**: For HTTP requests
- **Flask/Django**: Web frameworks
- **TensorFlow/PyTorch**: For machine learning