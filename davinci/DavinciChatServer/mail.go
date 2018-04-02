package main

import (
	"fmt"

	"time"
)

const (
	URL = "127.0.0.1:27017"
)

type Mail struct {
	MailID      int64
	ReceiverID  int
	SenderID    int
	SendTime    string
	ExpireTime  string
	MailType    int
	MailContent mailContent
}

type mailContent struct {
	Title        string
	ReceiverName string
	SenderName   string
	Content      string
	ExtraItem    string
}

func createMail(mail *Mail) {
	fmt.Println("create Mail")

	//*******插入元素*******
	mail.SendTime = time.Now().Format("2006-01-02 15:04:05")
	mail.ExpireTime = time.Now().AddDate(0, 0, 30).Format("2006-01-02 15:04:05")
	InsertMail(mail)
}

func getMail(pid int) []Mail {
	return databaseGetMail(pid)
}

func deleteMail(mid int64) {
	databaseDeleteMail(mid)
}
