in_put="tEjas"
in_put=in_put.lower()
vowels=["a","e","i","o","u"]
count=0
for ele in [*in_put]:
    if ele in  vowels:
        count+=1
print(count)