from openai import OpenAI
client = OpenAI()

completion = client.chat.completions.create(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "system", "content": "You are a customer service agent for a bank, skilled in explaining complex products in simple language."},
    {"role": "user", "content": "Explain the difference between investing in a unit trust fund and investing in individual equities"}
  ]
)

print(completion.choices[0].message)