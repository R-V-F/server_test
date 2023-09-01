import requests

from bs4 import BeautifulSoup

link = 'https://hypeauditor.com/top-youtube-news-politics-argentina/most-viewed/'
# f = open("page.txt", "w")
req = requests.get(link)
bs = BeautifulSoup(req.text, 'html.parser')
# f.write(bs.prettify())


# print(req)
pesquisa = bs.find("UnMundo")
print(pesquisa)
# print(bs.prettify())