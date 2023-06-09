all: bindata.go

.PHONY: go-bindata
go-bindata:
	go install github.com/jteeuwen/go-bindata/...

bindata.go: go-bindata static/index.html static/main.js
	go-bindata -pkg='bindata' -o bindata/bindata.go static/

clean:
	rm bindata/bindata.go
