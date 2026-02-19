// Top enthusiast vehicles — seeded in the vehicles table
// Used for create-build dropdowns and explore filter chips

export const POPULAR_VEHICLES = [
  // BMW
  { make: 'BMW', model: 'M3', chassis_code: 'E36', year_start: 1992, year_end: 1999 },
  { make: 'BMW', model: 'M3', chassis_code: 'E46', year_start: 2001, year_end: 2006 },
  { make: 'BMW', model: 'M3', chassis_code: 'E90', year_start: 2008, year_end: 2013 },
  { make: 'BMW', model: 'M3/M4', chassis_code: 'F8X', year_start: 2015, year_end: 2020 },
  { make: 'BMW', model: 'M3/M4', chassis_code: 'G8X', year_start: 2021, year_end: null },
  { make: 'BMW', model: 'M5', chassis_code: 'E39', year_start: 1999, year_end: 2003 },
  { make: 'BMW', model: 'M5', chassis_code: 'F10', year_start: 2012, year_end: 2016 },
  { make: 'BMW', model: '3 Series', chassis_code: 'E30', year_start: 1982, year_end: 1994 },
  // Toyota
  { make: 'Toyota', model: 'GR86', chassis_code: 'GR86', year_start: 2022, year_end: null },
  { make: 'Toyota', model: 'Supra', chassis_code: 'A90', year_start: 2019, year_end: null },
  { make: 'Toyota', model: 'Supra', chassis_code: 'A80', year_start: 1993, year_end: 2002 },
  // Subaru
  { make: 'Subaru', model: 'BRZ', chassis_code: 'BRZ', year_start: 2022, year_end: null },
  { make: 'Subaru', model: 'WRX STI', chassis_code: 'GDB', year_start: 2004, year_end: 2021 },
  { make: 'Subaru', model: 'WRX', chassis_code: 'VA', year_start: 2015, year_end: 2021 },
  // Nissan
  { make: 'Nissan', model: '350Z', chassis_code: 'Z33', year_start: 2003, year_end: 2009 },
  { make: 'Nissan', model: '370Z', chassis_code: 'Z34', year_start: 2009, year_end: 2021 },
  { make: 'Nissan', model: 'GT-R', chassis_code: 'R35', year_start: 2009, year_end: null },
  { make: 'Nissan', model: 'Silvia', chassis_code: 'S13', year_start: 1989, year_end: 1994 },
  { make: 'Nissan', model: 'Silvia', chassis_code: 'S14', year_start: 1994, year_end: 1999 },
  { make: 'Nissan', model: 'Silvia', chassis_code: 'S15', year_start: 1999, year_end: 2002 },
  // Honda
  { make: 'Honda', model: 'Civic Type R', chassis_code: 'FK8', year_start: 2017, year_end: 2021 },
  { make: 'Honda', model: 'Civic Type R', chassis_code: 'FL5', year_start: 2023, year_end: null },
  { make: 'Honda', model: 'S2000', chassis_code: 'AP1', year_start: 1999, year_end: 2003 },
  { make: 'Honda', model: 'S2000', chassis_code: 'AP2', year_start: 2004, year_end: 2009 },
  // Mazda
  { make: 'Mazda', model: 'MX-5 Miata', chassis_code: 'NA', year_start: 1989, year_end: 1997 },
  { make: 'Mazda', model: 'MX-5 Miata', chassis_code: 'NB', year_start: 1998, year_end: 2005 },
  { make: 'Mazda', model: 'MX-5 Miata', chassis_code: 'NC', year_start: 2006, year_end: 2015 },
  { make: 'Mazda', model: 'MX-5 Miata', chassis_code: 'ND', year_start: 2016, year_end: null },
  { make: 'Mazda', model: 'RX-7', chassis_code: 'FD', year_start: 1992, year_end: 2002 },
  // Mitsubishi
  { make: 'Mitsubishi', model: 'Lancer Evolution', chassis_code: 'CT9A', year_start: 2001, year_end: 2007 },
  { make: 'Mitsubishi', model: 'Lancer Evolution', chassis_code: 'CZ4A', year_start: 2008, year_end: 2015 },
  // Volkswagen
  { make: 'Volkswagen', model: 'Golf GTI', chassis_code: 'MK7', year_start: 2015, year_end: 2021 },
  { make: 'Volkswagen', model: 'Golf R', chassis_code: 'MK7', year_start: 2015, year_end: 2021 },
  // Ford
  { make: 'Ford', model: 'Mustang GT350', chassis_code: 'S550', year_start: 2016, year_end: 2020 },
  { make: 'Ford', model: 'Mustang GT500', chassis_code: 'S550', year_start: 2020, year_end: 2022 },
  { make: 'Ford', model: 'Focus RS', chassis_code: 'MK3', year_start: 2016, year_end: 2018 },
  // Chevrolet
  { make: 'Chevrolet', model: 'Corvette', chassis_code: 'C7', year_start: 2014, year_end: 2019 },
  { make: 'Chevrolet', model: 'Corvette', chassis_code: 'C8', year_start: 2020, year_end: null },
  { make: 'Chevrolet', model: 'Camaro', chassis_code: 'Gen6', year_start: 2016, year_end: null },
  // Porsche
  { make: 'Porsche', model: '911 Carrera', chassis_code: '992', year_start: 2019, year_end: null },
  { make: 'Porsche', model: '911 Carrera', chassis_code: '991', year_start: 2012, year_end: 2019 },
  { make: 'Porsche', model: 'Cayman / Boxster', chassis_code: '981', year_start: 2012, year_end: 2016 },
  { make: 'Porsche', model: 'Cayman / Boxster', chassis_code: '982', year_start: 2016, year_end: null },
]

// Chassis codes shown as filter chips on the Explore page
export const EXPLORE_FILTERS = [
  { label: 'All Builds', chassis: null },
  { label: 'BMW E36',    chassis: 'E36' },
  { label: 'BMW E46',    chassis: 'E46' },
  { label: 'BMW F8X',    chassis: 'F8X' },
  { label: 'BMW G8X',    chassis: 'G8X' },
  { label: 'GR86 / BRZ', chassis: 'GR86' },
  { label: 'Supra A90',  chassis: 'A90' },
  { label: 'Nissan 350Z', chassis: 'Z33' },
  { label: 'Nissan 370Z', chassis: 'Z34' },
  { label: 'WRX STI',    chassis: 'GDB' },
  { label: 'Civic Type R', chassis: 'FK8' },
  { label: 'MX-5 ND',   chassis: 'ND' },
]
