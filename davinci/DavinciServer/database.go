// mytest project main.go
package main

import (
	"database/sql"
	"fmt"
	_ "mysql-master"
	"strconv"
	//	"time"
)

func checkAccount(user string, psd string) bool {
	db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/davinci?charset=utf8")
	checkErr(err)

	//验证用户密码
	rows, err := db.Query("SELECT Password FROM Person WHERE Account='" + user + "'")
	checkErr(err)
	//fmt.Println(db)
	//fmt.Println("检查用户名密码")
	defer func() {
		db.Close()
		rows.Close()
	}()
	for rows.Next() {
		var password string
		err = rows.Scan(&password)
		checkErr(err)
		//fmt.Println("密码", password, psd, password == psd)
		if password == psd {
			//fmt.Println("检测成功")
			return true
		}
	}
	return false
}

func getPid(user string) int {
	db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/davinci?charset=utf8")
	checkErr(err)

	//获取PId
	rows, err := db.Query("SELECT P_Id FROM Person WHERE Account='" + user + "'")
	checkErr(err)
	//fmt.Println(db)
	//fmt.Println("检查用户名密码")
	defer func() {
		db.Close()
		rows.Close()
	}()
	for rows.Next() {
		var pid int
		err = rows.Scan(&pid)
		checkErr(err)
		return pid
	}
	return 0
}

func register(user string, psd string) bool {
	db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/davinci?charset=utf8")
	checkErr(err)

	//检查用户数据
	rows, err := db.Query("SELECT * FROM Person WHERE Account='" + user + "'")
	checkErr(err)

	//插入注册数据
	rows2, err := db.Prepare("INSERT Person SET Account=?,Password=?,Grade=?,RegisterDate=?,NickName=?")

	defer func() {
		db.Close()
		rows.Close()
		rows2.Close()
	}()
	if rows.Next() {
		return false
	}

	checkErr(err)
	//date := string(strconv.Itoa(time.Now().Year()) + "-" + time.Now().Month().String() + "-" + strconv.Itoa(time.Now().Day()))
	res, err := rows2.Exec(user, psd, strconv.Itoa(0), "2017-7-28", "")

	id, err := res.LastInsertId()
	checkErr(err)
	fmt.Println(id, "注册成功")
	return true
}
func requireGrade(user string) int {
	db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/davinci?charset=utf8")
	checkErr(err)

	//检查用户数据
	rows, err := db.Query("SELECT Grade FROM Person WHERE Account='" + user + "'")
	checkErr(err)
	defer func() {
		db.Close()
		rows.Close()
	}()
	if rows.Next() {
		var grade int
		rows.Scan(&grade)
		return grade
	}
	return 0
}
func increaseGrade(user string, num int) bool {
	db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/davinci?charset=utf8")
	checkErr(err)

	var grade int
	//检查用户数据
	rows, err := db.Query("SELECT Grade FROM Person WHERE Account='" + user + "'")
	//插入新分数
	rows2, err := db.Prepare("UPDATE Person SET Grade=? WHERE Account = '" + user + "'")
	checkErr(err)
	defer func() {
		db.Close()
		rows.Close()
		rows2.Close()
	}()
	if rows.Next() {
		rows.Scan(&grade)
		grade += num
		rows2.Exec(grade)
		return true
	} else {
		return false
	}
}
