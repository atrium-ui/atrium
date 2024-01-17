package main

import (
	"fmt"
	"io"
	"io/fs"
	"log"
	"os"
	"path/filepath"
)

var packageName = "@sv/components"
var defaultTemplateDest = "/src/components/ui"

func findNodeModules() (string, error) {
	cwd, err := os.Getwd()
	if err != nil {
		return "", fmt.Errorf("could not get current working directory")
	}

	// search for node_modules in parents from cwd up
	path := filepath.Join(cwd, "/node_modules")
	for {
		if _, err := os.Stat(path); os.IsNotExist(err) {
			path = filepath.Join(path, "../../node_modules")
		} else {
			break
		}
	}

	// doesnt exist
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return "", fmt.Errorf("could not find node_modules")
	}

	return path, nil
}

func getTemplates() ([]fs.DirEntry, error) {
	node_modules, err := findNodeModules()

	if err != nil {
		log.Fatal(err)
		return nil, err
	}

	entries, err := os.ReadDir(filepath.Join(node_modules, packageName, "/templates"))

	if err != nil {
		log.Fatal(err)
		return entries, err
	}

	return entries, nil
}

func useTemplate(name string) (int64, error) {
	node_modules, err := findNodeModules()
	if err != nil {
		return 0, err
	}

	cwd, err := os.Getwd()
	if err != nil {
		return 0, err
	}

	path := filepath.Join(node_modules, packageName, "/templates/"+name+".tsx")

	// doesnt exist
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return 0, fmt.Errorf("template does not exist: %s", path)
	}

	// get filename
	dest := filepath.Join(cwd, defaultTemplateDest, name+".tsx")

	return copy(path, dest)
}

func copy(src, dst string) (int64, error) {
	if _, err := os.Stat(dst); os.IsNotExist(err) {
		err := os.MkdirAll(filepath.Dir(dst), os.ModePerm)
		if err != nil {
			return 0, err
		}
	}

	source, err := os.Open(src)
	if err != nil {
		return 0, err
	}
	defer source.Close()

	destination, err := os.Create(dst)
	if err != nil {
		return 0, err
	}
	defer destination.Close()
	nBytes, err := io.Copy(destination, source)
	return nBytes, err
}
