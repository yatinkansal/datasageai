import ai

question = "How many customers do we have?"
context = "customers(customer_id, first_name, last_name)"
extra = "customers table has 100 rows. Columns: customer_id, first_name, last_name, phone, email, street, city, state, zip_code.\n{'customer_id': 1, 'first_name': 'John', 'last_name': 'Doe'}"

print("Testing Local Chat Integration...")
answer = ai.chat_with_ai(question, context, extra_context=extra)
print("AI Chat Response:", answer)

print("\nTesting Column Doc:")
print(ai.generate_column_documentation("customers", "first_name", "varchar", ["John", "Jane", "Alice"]))

print("\nTesting SQL Generator:")
print(ai.generate_sql("count customers", "schema string here"))
