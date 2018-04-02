package main

import (
	"encoding/json"
	//	"fmt"
)

func JMessage(data []byte) map[string]interface{} {
	var result map[string]interface{}
	err := json.Unmarshal(data, &result)
	checkErr(err)
	return result
}

func toJson(maps interface{}) []byte {
	re, err := json.Marshal(maps)
	checkErr(err)
	return re
}

func JCard(data map[string]interface{}) card {
	var result card
	re, err := json.Marshal(data)
	checkErr(err)
	err2 := json.Unmarshal(re, &result)
	checkErr(err2)
	return result
}
