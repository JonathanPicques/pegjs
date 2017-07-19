| Precedence |                    Operator                   | Associativity | Description                                                                 |
|------------|:---------------------------------------------:|:-------------:|-----------------------------------------------------------------------------|
| 0          |                      (…)                      |      ...      | Grouping                                                                    |
| 1          |                      ! …                      | left-to-right | Logical NOT                                                                 |
| 2          |                      ~ …                      | left-to-right | Bitwise NOT                                                                 |
| 3          |                      + …                      | left-to-right | Unary Plus                                                                  |
| 4          |                      - …                      | left-to-right | Unary Negation                                                              |
| 5          |                     … ** …                    | right-to-left | Exponentiation                                                              |
| 6          |           … * …<br/>… / …<br/>… % …           | right-to-left | Multiplication<br/>Division<br/>Remainder                                   |
| 7          |                … + …<br/>… - …                | right-to-left | Addition<br/>Subtraction                                                    |
| 8          |         … << …<br/>… >> …<br/>… >>> …         | right-to-left | Bitwise Left Shift<br/>Bitwise Right Shift<br/>Bitwise Unsigned Right Shift |
| 9          |     … < …<br/>… <= …<br/>… > …<br/>… >= …     | right-to-left | Less Than<br/>Less Than Or Equal<br/>Greater Than<br/>Greater Than Or Equal |
| 10         | … == …<br/>  … != …<br/> … === …<br/> … !== … | right-to-left | Equality<br/>Inequality<br/>Strict Equality<br/>Strict Inequality           |
| 11         |                     … & …                     | right-to-left | Bitwise AND                                                                 |
| 12         |                     … ^ …                     | right-to-left | Bitwise XOR                                                                 |
| 13         |                     … \| …                     | right-to-left | Bitwise OR                                                                  |
| 14         |                     … && …                    | right-to-left | Logical AND                                                                 |
| 15         |                     … \|\| …                    | right-to-left | Logical OR                                                                  |
| 16         |              … ? … : …<br/>… ?: …             | left-to-right | Conditional Ternary<br/>Conditional Elvis                                   |