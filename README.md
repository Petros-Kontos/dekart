```
docker build -t dekart_image . --no-cache
```
```
docker create --name dekart_container -it --env OPENAI_API_KEY=your-api-key-here dekart_image
```
```
docker start dekart_container
```
```
docker exec -it dekart_container src/dekart.mjs
```
