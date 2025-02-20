package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

const dataFile = "attendance.json"
const frontendDir = "../frontend"

type Attendance struct {
	Students []struct {
		Name       string   `json:"name"`
		Attendance []string `json:"attendance"`
	} `json:"students"`
}

func getDates() []string {
	var dates []string
	today := time.Now()
	for i := -7; i <= 20; i++ {
		date := today.AddDate(0, 0, i).Format("2006-01-02")
		dates = append(dates, date)
	}
	return dates
}

func loadAttendance(w http.ResponseWriter, r *http.Request) {
	file, err := os.Open(dataFile)
	if err != nil {
		http.Error(w, "Error loading data", http.StatusInternalServerError)
		return
	}
	defer file.Close()

	var attendance Attendance
	err = json.NewDecoder(file).Decode(&attendance)
	if err != nil {
		http.Error(w, "Error decoding data", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(attendance)
}

func saveAttendance(w http.ResponseWriter, r *http.Request) {
	var attendance Attendance
	if err := json.NewDecoder(r.Body).Decode(&attendance); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	file, err := os.Create(dataFile)
	if err != nil {
		http.Error(w, "Error saving data", http.StatusInternalServerError)
		return
	}
	defer file.Close()
	json.NewEncoder(file).Encode(attendance)
	w.WriteHeader(http.StatusOK)
}

func serveStaticFiles() {
	fs := http.FileServer(http.Dir(frontendDir))
	http.Handle("/", fs)
}

func main() {
	serveStaticFiles()
	http.HandleFunc("/save", saveAttendance)
	http.HandleFunc("/load", loadAttendance)

	fmt.Println("Server is running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
