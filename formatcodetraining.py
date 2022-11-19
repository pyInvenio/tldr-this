import json


filepath = './python/final/jsonl/train/python_train_0.jsonl'
data = []
with open(filepath) as f:
    for line in f:
        data.append(json.loads(line))
        
# dict_keys(['repo', 'path', 'func_name', 'original_string', 'language', 'code', 'code_tokens', 'docstring', 'docstring_tokens', 'sha', 'url', 'partition'])
print(len(data))
f = open("train.txt", "w", encoding="utf-8")
f.write("This program takes in a Code segment and coding Language and outputs the Code Tokens and Docstring for the code:\n\n")
for d in data[401:500]:
    f.write("Code:" + d['code'].replace('\n', '\\n') + "\n")
    f.write("Language: " + d['language'] + "\n")
    f.write("Code Tokens: " + str(d['code_tokens']) + "\n")
    f.write("Docstring: " + d['docstring'].replace('\n', '').replace('\r','') + "\n")
    f.write("*******__*******\n")

f.close()