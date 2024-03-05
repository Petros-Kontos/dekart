# dekart

### Instructions

```
docker build -t dekart_image . --no-cache
```
```
docker create --name dekart_container -it --env OPENAI_API_KEY=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 dekart_image
```
```
docker start dekart_container
```
```
docker exec -it dekart_container src/dekart.mjs
```
