package main

import (
	"fmt"
	"github.com/aitsvet/debugcharts"
	"log"
	"net/http"
	"runtime"
	"time"

	_ "net/http/pprof"

	_ "github.com/aitsvet/debugcharts"
)

func dummyCPUUsage() {
	var a uint64
	var t = time.Now()
	for {
		t = time.Now()
		a += uint64(t.Unix())
	}
}

func dummyAllocations() {
	var d []uint64

	for {
		for i := 0; i < 2*1024*1024; i++ {
			d = append(d, 42)
		}
		time.Sleep(time.Second * 10)
		fmt.Println(len(d))
		d = make([]uint64, 0)
		runtime.GC()
		time.Sleep(time.Second * 10)
	}
}

func main() {
	go dummyAllocations()
	go dummyCPUUsage()

	http.HandleFunc("/rps", func(_ http.ResponseWriter, _ *http.Request) {
		debugcharts.RPS.Add(1)
	})
	go func() {
		t := time.NewTicker(time.Second)
		for range t.C {
			debugcharts.RPS.Set(0)
		}
	}()

	go func() {
		log.Fatal(http.ListenAndServe(":8080", nil))
	}()
	log.Printf("you can now open http://localhost:8080/debug/charts/ in your browser")
	select {}
}
