package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

const API_URL = "https://api.openai.com/v1/responses"

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type Body struct {
	Model string    `json:"model"`
	Input []Message `json:"input"`
}

func CallLLM(content string) (string, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("missing OPENAI_API_KEY environment variable")
	}
	requestBody := Body{
		Model: "gpt-5-mini",
		Input: []Message{
			{Role: "user", Content: content},
		},
	}
	jsonBytes, err := json.Marshal(requestBody)
	if err != nil {
		return "", err
	}
	request, err := http.NewRequest("POST", API_URL, bytes.NewReader(jsonBytes))
	if err != nil {
		return "", err
	}
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Authorization", apiKey)
	client := &http.Client{}
	response, err := client.Do(request)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	responseBody, err := io.ReadAll(response.Body)
	if err != nil {
		return "", err
	}
	return string(responseBody), nil
}

func main() {
	reader := bufio.NewReader(os.Stdin)
	prompt, err := reader.ReadString('\n')
	if err != nil {
		panic(err)
	}
	response, err := CallLLM(prompt)
	if err != nil {
		panic(err)
	}
	fmt.Println(response)
}
