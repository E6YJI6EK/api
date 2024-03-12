-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Mar 12, 2024 at 09:43 PM
-- Server version: 5.7.24
-- PHP Version: 8.0.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sport_school`
--

-- --------------------------------------------------------

--
-- Table structure for table `achievements`
--

CREATE TABLE `achievements` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `descritption` text NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `disciplines`
--

CREATE TABLE `disciplines` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `disciplines`
--

INSERT INTO `disciplines` (`id`, `name`, `user_id`) VALUES
(1, 'Пауэр-лифтинг', 2),
(2, 'Гиревой спорт', 8),
(3, 'Армрестлинг', 15);

-- --------------------------------------------------------

--
-- Table structure for table `groups`
--

CREATE TABLE `groups` (
  `coach_id` int(11) NOT NULL,
  `sportsman_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `patronymic` varchar(50) NOT NULL,
  `birthday_date` date NOT NULL,
  `user_type` enum('coach','sportsman','admin') NOT NULL,
  `gender` enum('male','female') NOT NULL,
  `contact_data` varchar(100) NOT NULL,
  `login` varchar(20) NOT NULL,
  `password` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `last_name`, `patronymic`, `birthday_date`, `user_type`, `gender`, `contact_data`, `login`, `password`) VALUES
(1, 'rab', 'rabov', '333', '2024-03-15', 'sportsman', 'male', '880055536356', '43534', '345345345345345'),
(2, 'Сергей', 'Воронов', 'Михайлович', '2024-03-31', 'coach', 'male', '880055536356', 'zhopa', '123456789'),
(3, 'rab', 'fdgdfgdfg', '333', '2024-03-23', 'sportsman', 'female', '880055536356', '56765', '567567567'),
(4, 'Айшат', 'Нуржанов', '333', '2024-02-29', 'sportsman', 'male', '7777777777777', '[eq', '123456789'),
(7, 'fdghfghfg', 'fghfghfg', 'hfghfghfgh', '2024-03-03', 'sportsman', 'male', '4564567547567', '56756756', '567567567'),
(8, 'Иван', 'Иванов', 'Иванович', '2024-03-01', 'coach', 'female', '1231231231', '12312312', '123123123'),
(9, 'нет!!!', 'Лаб', '123213', '2024-03-22', 'sportsman', 'female', 'sd45345345', '456456456', '454456456'),
(13, 'asdasdas', 'fdgdfgdfg', '234234', '2024-03-08', 'sportsman', 'female', '880055536356', 'aboba', '123'),
(14, 'пк', 'Лаб', 'hfghfghfgh', '2024-03-23', 'sportsman', 'female', 'sd45345345', 'fdgfdg', 'dfgdfgdfg'),
(15, 'Юлия', 'Немых', 'Викторовна', '2024-03-23', 'coach', 'female', '34534543354354', 'qqqqq', 'qqqqqq'),
(16, 'Егор', 'Андреев', 'Сергеевич', '2003-10-16', 'admin', 'male', '88005553535', 'admin', 'root');

-- --------------------------------------------------------

--
-- Table structure for table `workouts`
--

CREATE TABLE `workouts` (
  `id` int(11) NOT NULL,
  `begin_datetime` datetime NOT NULL,
  `end_datetime` datetime NOT NULL,
  `discipline_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Triggers `workouts`
--
DELIMITER $$
CREATE TRIGGER `delete_expired_workouts` BEFORE INSERT ON `workouts` FOR EACH ROW IF NEW.end_datetime < NOW() THEN
        DELETE FROM workouts WHERE id = NEW.id;
END IF
$$
DELIMITER ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `achievements`
--
ALTER TABLE `achievements`
  ADD PRIMARY KEY (`id`,`user_id`),
  ADD KEY `achievemnets_user_id` (`user_id`);

--
-- Indexes for table `disciplines`
--
ALTER TABLE `disciplines`
  ADD PRIMARY KEY (`id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`coach_id`,`sportsman_id`),
  ADD KEY `sportsman_user_id` (`sportsman_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `login` (`login`);

--
-- Indexes for table `workouts`
--
ALTER TABLE `workouts`
  ADD PRIMARY KEY (`id`,`discipline_id`),
  ADD KEY `workouts_disciplne_id` (`discipline_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `achievements`
--
ALTER TABLE `achievements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `disciplines`
--
ALTER TABLE `disciplines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `workouts`
--
ALTER TABLE `workouts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `achievements`
--
ALTER TABLE `achievements`
  ADD CONSTRAINT `achievemnets_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `disciplines`
--
ALTER TABLE `disciplines`
  ADD CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `groups`
--
ALTER TABLE `groups`
  ADD CONSTRAINT `coach_user_id` FOREIGN KEY (`coach_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sportsman_user_id` FOREIGN KEY (`sportsman_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `workouts`
--
ALTER TABLE `workouts`
  ADD CONSTRAINT `workouts_disciplne_id` FOREIGN KEY (`discipline_id`) REFERENCES `disciplines` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
