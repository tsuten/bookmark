from fastapi import FastAPI
from pydantic import BaseModel, HttpUrl
import uvicorn
import requests
from bs4 import BeautifulSoup

app = FastAPI()

class GetTitleRequest(BaseModel):
    url: HttpUrl


def extract_title(soup: BeautifulSoup) -> str | None:
    og_title = soup.find("meta", property="og:title")
    if og_title and og_title.get("content"):
        return og_title["content"].strip()

    if soup.title and soup.title.string:
        return soup.title.string.strip()

    return None


@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.post("/get-title")
def get_title(body: GetTitleRequest):
    response = requests.get(str(body.url), timeout=10)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    return {"title": extract_title(soup)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)