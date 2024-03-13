const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateSecret = () => {
  return crypto.randomBytes(32).toString("hex");
};

const app = express();

app.use(bodyParser.json());
app.use(cors());

//Подключение к БД
const port = 3336;
const SECRET_KEY = generateSecret();

const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "sport_school",
});
//Конец подключения к БД

app.get("/", (req, res) => {
  res.send("Привет API");
});

app.post("/register", (req, res) => {
  const {
    name,
    lastName,
    patronymic,
    birthdayDate,
    userType,
    gender,
    contactData,
    login,
    password,
  } = req.body;

  db.query("SELECT * FROM users WHERE login = ?", login, (err, result) => {
    if (err) {
      res.send({ message: `${err}` });
    } else {
      if (result.length > 0) {
        res.send({
          isSuccess: false,
          isFailure: true,
          message: "Данный пользователь уже зарегистрирован",
        });
      } else {
        db.query(
          "INSERT INTO users (name, last_name,  patronymic, birthday_date, user_type, gender, contact_data, login, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            name,
            lastName,
            patronymic,
            birthdayDate,
            userType,
            gender,
            contactData,
            login,
            password,
          ],
          (err, result) => {
            if (result) {
              const token = jwt.sign(
                {
                  name,
                  last_name: lastName,
                  patronymic,
                  birthday_date: birthdayDate,
                  user_type: userType,
                  gender,
                  contact_data: contactData,
                },
                SECRET_KEY,
                { expiresIn: "6h" }
              );
              res.send({
                isSuccess: true,
                isFailure: false,
                message: "Вы успешно зарегистрировались",
                data: {
                  token: token,
                },
              });
            } else {
              res.send({
                isSuccess: false,
                isFailure: true,
                message: `${err}`,
              });
            }
          }
        );
      }
    }
  });
});

app.post("/login", (req, res) => {
  const { login, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE login = ? && password = ?",
    [login, password],
    (err, result) => {
      if (err) {
        req.setEncoding({ err: err });
      } else {
        if (result.length > 0) {
          const token = jwt.sign(
            {
              ...result[0],
            },
            SECRET_KEY,
            { expiresIn: "6h" }
          );
          res.send({
            isSuccess: true,
            isFailure: false,
            message: "Вы успешно авторизовались",
            data: {
              token: token,
            },
          });
        } else {
          res.send({
            isSuccess: false,
            isFailure: true,
            message: "Неверный логин или пароль",
          });
        }
      }
    }
  );
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res.status(401).send({
      isSuccess: false,
      isFailure: true,
      message: `Доступ запрещён`,
    });
  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send({
      isSuccess: false,
      isFailure: true,
      message: `Некорректный токен`,
    });
  }
}

function checkTokenExpiration(token, logoutCallback) {
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      logoutCallback(`Ошибка при верификации токена: ${err}`); // Вызов функции logout в случае ошибки при верификации токена
    } else {
      const now = Math.floor(Date.now() / 1000); // Текущее время в секундах
      if (decoded.exp < now) {
        logoutCallback("Токен просрочен"); // Вызов функции logout, если токен просрочен
      } else {
        return true;
      }
    }
  });
}

app.post("/verifyToken", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    if (
      checkTokenExpiration(token, (message) => {
        res.status(500).json({
          isSuccess: false,
          isFailure: true,
          message: message,
        });
      })
    ) {
      res.status(200).json({
        isSuccess: true,
        isFailure: false,
        message: "Токен действителен",
      });
    }
  } else {
    res.status(401).json({
      isSuccess: false,
      isFailure: true,
      message: "Токен отсутствует",
    });
  }
});

app.get("/user/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM users WHERE id = ?", id, (err, result) => {
    if (err) {
      res.send({ isSuccess: false, isFailure: true, message: `${err}` });
    } else {
      if (result.length > 0) {
        res.send({
          isSuccess: true,
          isFailure: false,
          data: {
            ...result[0],
          },
        });
      }
    }
  });
});

app.post("/edit-contact-data", authenticateToken, (req, res) => {
  const { id, contactData } = req.body;
  db.query(
    `UPDATE users
  SET contact_data = ?
  WHERE id = ?`,
    [contactData, id],
    (err, result) => {
      if (err) {
        res.send({ isSuccess: false, isFailure: true, message: `${err}` });
      } else {
        res.send({
          isSuccess: true,
          isFailure: false,
          message: "Контактные данные успешно изменены",
        });
      }
    }
  );
});

app.post("/edit-password", authenticateToken, (req, res) => {
  const { id, oldPassword, newPassword } = req.body;
  db.query(`SELECT password FROM users WHERE id=?`, [id], (err, result) => {
    if (err) {
      res.send({ isSuccess: false, isFailure: true, message: `${err}` });
    } else {
      if (result[0].password == oldPassword) {
        db.query(
          `UPDATE users
        SET password = ?
        WHERE id = ?`,
          [newPassword, id],
          (err, result) => {
            if (err) {
              res.send({
                isSuccess: false,
                isFailure: true,
                message: `${err}`,
              });
            } else {
              res.send({
                isSuccess: true,
                isFailure: false,
                message: "Пароль успешно изменён",
              });
            }
          }
        );
      } else {
        res.send({
          isSuccess: false,
          isFailure: true,
          message: `Пароли не совпадают`,
        });
      }
    }
  });
});

app.post("/create-workout", authenticateToken, (req, res) => {
  const { beginDatetime, endDatetime, disciplineId } = req.body;
  const { user_type } = req.user;
  if (user_type == "coach" || user_type == "admin") {
    db.query(
      `INSERT INTO workouts (begin_datetime, end_datetime, discipline_id) VALUES (?, ?, ?)`,
      [beginDatetime, endDatetime, disciplineId],
      (err, result) => {
        if (err) {
          res.send({ isSuccess: false, isFailure: true, message: `${err}` });
        } else {
          res.send({
            isSuccess: true,
            isFailure: false,
            message: `Тренировка создана`,
          });
        }
      }
    );
  } else {
    res.status(403).send({
      isSuccess: false,
      isFailure: true,
      message: `Доступ запрещён`,
    });
  }
});

app.post("/create-discipline", authenticateToken, (req, res) => {
  const { name, userId } = req.body;
  const { user_type } = req.user;
  if (user_type === "admin") {
    db.query(
      `INSERT INTO disciplines (name, user_id) VALUES (?, ?)`,
      [name, userId],
      (err, result) => {
        if (err) {
          res.send({ isSuccess: false, isFailure: true, message: `${err}` });
        } else {
          res.send({
            isSuccess: true,
            isFailure: false,
            message: `Дисциплина создана`,
          });
        }
      }
    );
  } else {
    res.status(403).send({
      isSuccess: false,
      isFailure: true,
      message: `Доступ запрещён`,
    });
  }
});

app.get("/get-achievements", authenticateToken, (req, res) => {
  const { id } = req.user;
  db.query(
    `SELECT * FROM achievements WHERE user_id = ?`,
    [id],
    (err, result) => {
      if (err) {
        res.send({ isSuccess: false, isFailure: true, message: `${err}` });
      } else {
        res.send({
          isSuccess: true,
          isFailure: false,
          data: result,
        });
      }
    }
  );
});

app.post("/create-achievement", authenticateToken, (req, res) => {
  const { date, description } = req.body;
  const { id } = req.user;
  db.query(
    `INSERT INTO achievements (date, description, user_id) VALUES (?, ?, ?)`,
    [date, description, id],
    (err, result) => {
      if (err) {
        res.send({ isSuccess: false, isFailure: true, message: `${err}` });
      } else {
        res.send({
          isSuccess: true,
          isFailure: false,
          message: `Достижение добавлено`,
        });
      }
    }
  );
});

app.get("/get-coaches", authenticateToken, (req, res) => {
  db.query("SELECT * FROM users WHERE user_type = 'coach'", (err, result) => {
    if (err) {
      res.send({ isSuccess: false, isFailure: true, message: `${err}` });
    } else {
      res.send({
        isSuccess: true,
        isFailure: false,
        data: result,
      });
    }
  });
});

app.get("/get-disciplines", authenticateToken, (req, res) => {
  db.query("SELECT * FROM disciplines", (err, result) => {
    if (err) {
      res.send({ isSuccess: false, isFailure: true, message: `${err}` });
    } else {
      res.send({
        isSuccess: true,
        isFailure: false,
        data: result,
      });
    }
  });
});

app.get("/show-schedule", authenticateToken, (req, res) => {
  db.query(
    `
  SELECT
    d.name as d_name,
    w.begin_datetime,
    w.end_datetime,
    u.last_name,
    u.name,
    u.patronymic
  FROM workouts AS w
  JOIN disciplines AS d
  ON d.id = w.discipline_id
  JOIN users AS u
  ON u.id = d.user_id
  `,
    (err, result) => {
      if (err) {
        res.send({ isSuccess: false, isFailure: true, message: `${err}` });
      } else {
        res.send({
          isSuccess: true,
          isFailure: false,
          data: result,
        });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Тестовое приложение работaет на порту ${port}`);
});
