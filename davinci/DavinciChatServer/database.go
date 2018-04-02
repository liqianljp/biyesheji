// mytest project main.go
package main

import (
	"database/sql"
	"fmt"
	_ "mysql-master"
	"strconv"
	//	"time"

	"gopkg.in/mgo.v2-unstable"
	"gopkg.in/mgo.v2-unstable/bson"
)

func makeFriends(name1 string, name2 string) bool {
	db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/davinci?charset=utf8")
	checkErr(err)

	check, err := db.Query("SELECT P_Id FROM Person WHERE Account='" + name1 + "' or Account='" + name2 + "'")
	row, err := db.Prepare("INSERT Friends SET UserID1=?,UserID2=?")
	var n1, n2 int
	if check.Next() {
		err = check.Scan(&n1)
		checkErr(err)
	}
	if check.Next() {
		err = check.Scan(&n2)
		checkErr(err)
	}
	row.Exec(n1, n2)

	defer func() {
		check.Close()
		row.Close()
		db.Close()
	}()
	return true
}

func getFriends(uid1 int) map[int]*Friends {
	db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/davinci?charset=utf8")
	checkErr(err)
	u1 := strconv.Itoa(uid1)

	row, err := db.Query("SELECT Account,P_Id,Grade,HeadImage FROM Person WHERE P_Id in (SELECT UserID2 FROM Friends WHERE UserID1 =" + u1 +
		" UNION ALL SELECT UserID1 FROM Friends WHERE UserID2 =" + u1 + ")")
	result := make(map[int]*Friends)
	for row.Next() {
		var account, headImage string
		var pid, grade int
		err = row.Scan(&account, &pid, &grade, &headImage)
		checkErr(err)
		result[pid] = &Friends{
			Name:      account,
			P_id:      pid,
			Grade:     grade,
			HeadImage: headImage,
		}
	}
	defer func() {
		row.Close()
		db.Close()
	}()
	return result

}

func findFriends(word string) []*Friends {
	db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/davinci?charset=utf8")
	checkErr(err)

	fmt.Println("findf ", word)
	row, err := db.Query("SELECT Account,P_Id,Grade,HeadImage FROM Person WHERE Account LIKE '%" + word + "%'")
	result := make([]*Friends, 0, 30)
	for row.Next() {
		var account, headImage string
		var pid, grade int
		err = row.Scan(&account, &pid, &grade, &headImage)
		checkErr(err)
		result = append(result, &Friends{
			Name:      account,
			P_id:      pid,
			Grade:     grade,
			HeadImage: headImage,
		})
	}
	defer func() {
		row.Close()
		db.Close()
	}()
	return result

}

func DeleteFriends(uid1 int, uid2 int) bool {
	db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/davinci?charset=utf8")
	checkErr(err)

	fmt.Println("deletef ", uid1, " ", uid2)
	row, err := db.Prepare("DELETE FROM Friends WHERE UserID1=? and UserID2=?")

	row.Exec(uid1, uid2)
	row.Exec(uid2, uid1)
	defer func() {
		row.Close()
		db.Close()
	}()
	return true
}

func IsFriends(uid1 int, uid2 int) bool {
	db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/davinci?charset=utf8")
	checkErr(err)
	u1 := strconv.Itoa(uid1)
	u2 := strconv.Itoa(uid2)

	//验证用户密码
	rows, err := db.Query("select * from Friends Where UserID1=" + u1 + " and UserID2=" + u2 + " UNION select * from Friends Where UserID1=" + u2 + " and UserID2=" + u1)
	checkErr(err)
	//fmt.Println(db)
	//fmt.Println("检查用户名密码")
	defer func() {
		db.Close()
		rows.Close()
	}()
	if rows.Next() {
		return true
	}
	return false
}

var totalMailID int64 = 0

func InsertMail(m *Mail) {
	session, err := mgo.Dial(URL)
	if err != nil {
		panic(err)
	}
	defer session.Close()
	session.SetMode(mgo.Monotonic, true)
	m.MailID = totalMailID
	totalMailID++
	db := session.DB("davinci") //数据库名称
	collection := db.C("mail")  //如果该集合已经存在的话，则直接返回

	//	//*****集合中元素数目********
	//	countNum, err := collection.Count()
	//	if err != nil {
	//		panic(err)
	//	}
	//	fmt.Println("Things objects count: ", countNum)

	//一次可以插入多个对象 插入两个Person对象
	err = collection.Insert(m)
	if err != nil {
		panic(err)
	}
}

func databaseGetMail(uid int) []Mail {
	session, err := mgo.Dial(URL)
	if err != nil {
		panic(err)
	}
	defer session.Close()
	session.SetMode(mgo.Monotonic, true)

	db := session.DB("davinci") //数据库名称
	collection := db.C("mail")  //如果该集合已经存在的话，则直接返回

	var mailAll []Mail //存放结果
	result := Mail{}
	iter := collection.Find(bson.M{"receiverid": uid}).Iter()
	for iter.Next(&result) {
		fmt.Printf("Result: %v\n", result)
		mailAll = append(mailAll, result)
	}
	fmt.Println("\nmailALL", mailAll)
	return mailAll
}

func databaseDeleteMail(uid int64) {
	session, err := mgo.Dial(URL)
	if err != nil {
		panic(err)
	}
	defer session.Close()
	session.SetMode(mgo.Monotonic, true)

	db := session.DB("davinci") //数据库名称
	collection := db.C("mail")  //如果该集合已经存在的话，则直接返回

	//******删除数据************
	_, err = collection.RemoveAll(bson.M{"mailid": uid})
}

//func checkAccount(user string, psd string) bool {
//	db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/davinci?charset=utf8")
//	checkErr(err)

//	//验证用户密码
//	rows, err := db.Query("SELECT Password FROM User WHERE Account='" + user + "'")
//	checkErr(err)
//	//fmt.Println(db)
//	//fmt.Println("检查用户名密码")
//	defer func() {
//		db.Close()
//		rows.Close()
//	}()
//	for rows.Next() {
//		var password string
//		err = rows.Scan(&password)
//		checkErr(err)
//		//fmt.Println("密码", password, psd, password == psd)
//		if password == psd {
//			//fmt.Println("检测成功")
//			return true
//		}
//	}
//	return false
//}
//func register(user string, psd string) bool {
//	db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/davinci?charset=utf8")
//	checkErr(err)

//	//检查用户数据
//	rows, err := db.Query("SELECT * FROM User WHERE Account='" + user + "'")
//	checkErr(err)

//	//插入注册数据
//	rows2, err := db.Prepare("INSERT User SET Account=?,Password=?,Grade=?,RegisterDate=?,NickName=?")

//	defer func() {
//		db.Close()
//		rows.Close()
//		rows2.Close()
//	}()
//	if rows.Next() {
//		return false
//	}

//	checkErr(err)
//	//date := string(strconv.Itoa(time.Now().Year()) + "-" + time.Now().Month().String() + "-" + strconv.Itoa(time.Now().Day()))
//	res, err := rows2.Exec(user, psd, strconv.Itoa(0), "2017-7-28", "")

//	id, err := res.LastInsertId()
//	checkErr(err)
//	fmt.Println(id, "注册成功")
//	return true
//}
//func requireGrade(user string) int {
//	db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/davinci?charset=utf8")
//	checkErr(err)

//	//检查用户数据
//	rows, err := db.Query("SELECT Grade FROM User WHERE Account='" + user + "'")
//	checkErr(err)
//	defer func() {
//		db.Close()
//		rows.Close()
//	}()
//	if rows.Next() {
//		var grade int
//		rows.Scan(&grade)
//	}

//	checkErr(err)
//	return 0
//}
