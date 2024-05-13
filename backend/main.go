package main

import (
	"context"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/google/generative-ai-go/genai"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"google.golang.org/api/option"
)

type RequestBody struct {
	Msg  string `json:"msg"`
	Lang string `json:lang"`
}

func AskGemini(body string, language string) []byte {
	err := godotenv.Load()
	if err != nil {
		log.Fatal(err)
	}
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(os.Getenv("API_KEY")))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	// For text-only input, use the gemini-pro model
	model := client.GenerativeModel("gemini-1.0-pro-latest")
	// Initialize the chat
	cs := model.StartChat()
	cs.History = []*genai.Content{
		{
			Parts: []genai.Part{
				genai.Text("Given the following info, parse to a class {'id': 1, 'nombre':'Santiago'} javascript. No pongas ``` y luego el lenguaje, devuelve el mensaje entre comillas dobles"),
			},
			Role: "user",
		},
		{
			Parts: []genai.Part{
				genai.Text(`
			class User {
				constructor(nombre,id) {
				this.nombre = nombre;
				this.id = id;
				}
				getNombre() {
				return this.nombre;
				}
				getId() {
				return this.id;
				}
			}
		`),
			},
			Role: "model",
		},
		{
			Parts: []genai.Part{
				genai.Text(`
				{
					"branch": "development",
					"last_commit": "feat: Add parsing logic for JavaScript class in AskGemini function",
					"contributor": "Santiago1809",
					"at": "05-12-2024 10:14 p.m."
				}
				cs
				`),
			},
			Role: "user",
		},
		{
			Parts: []genai.Part{
				genai.Text(`
				using System;

				public class CommitInfo
				{
						public string branch { get; set; }
						public string last_commit { get; set; }
						public string contributor { get; set; }
						public string at { get; set; }
				
						public CommitInfo(string branch, string lastCommit, string contributor, string at)
						{
								this.branch = branch;
								this.last_commit = lastCommit;
								this.contributor = contributor;
								this.at = at;
						}
				
						public override string ToString()
						{
								return $"Branch: {branch}\nLast Commit: {last_commit}\nContributor: {contributor}\nAt: {at}";
						}
				}				
				`),
			},
			Role: "model",
		},
	}

	resp, err := cs.SendMessage(ctx, genai.Text(body+" "+language))
	if err != nil {
		log.Fatal(err)
	}
	marshalContent, _ := json.MarshalIndent(resp.Candidates, "", " ")
	return marshalContent

}
func main() {
	router := http.NewServeMux()
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"POST"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		ExposedHeaders:   []string{"Content-Type"},
		AllowCredentials: true,
	})
	handler := corsHandler.Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			log.Println("Error al leer el cuerpo de la solicitud:", err)
			http.Error(w, "Error al leer el cuerpo de la solicitud", http.StatusBadRequest)
			return
		}
		defer r.Body.Close()

		// Decodificar el JSON del cuerpo de la solicitud
		var requestBody RequestBody
		err = json.Unmarshal(body, &requestBody)
		if err != nil {
			log.Println("Error al decodificar el JSON del cuerpo de la solicitud:", err)
			http.Error(w, "Error al decodificar el JSON del cuerpo de la solicitud", http.StatusBadRequest)
			return
		}

		w.Header().Set("Content-Type", "application/json")

		res := AskGemini(requestBody.Msg, requestBody.Lang)
		w.Write(res)
	}))
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
    handler.ServeHTTP(w, r)
})
	log.Println("Server listening on port 8080")
	err := http.ListenAndServe(":8080", router)
	log.Fatal(err)
}
