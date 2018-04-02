//命令集
package main

type typeSet float64

const (
	RequestLogin          = float64(10001)
	RequestStart          = float64(10008)
	RequestStartInfo      = float64(10013)
	RequestCancelMatching = float64(10016)
	RequestOnline         = float64(10018)
	RequestGuess          = float64(10022)
	RequestGuessStatus    = float64(10025)
	RequestContinueGuess  = float64(10026)
	RequestTurnChange     = float64(10028)
	RequestJokerCard      = float64(10041)

	LoginSuccess       = float64(10002)
	LoginFailed        = float64(10003)
	StartMatching      = float64(10009)
	StartGame          = float64(10014)
	ContinueMatch      = float64(10015)
	CancelMatchSuccess = float64(10017)
	CancelMatchFail    = float64(10019)
	Online             = float64(10020)
	Offline            = float64(10021)
	GuessInfo          = float64(10023)
	NoGuessInfo        = float64(10024)
	ContinueGuess      = float64(10029)
	NextTurn           = float64(10030)
	NoNextTurn         = float64(10031)
	GameOver           = float64(10035)
	JokerCardSucc      = float64(10043)
)
