db.department.insertMany([
	{
		"_id": 5,
		"name": "Research",
		"manager_emp_id": "333445555",
		"manager_start_date": ISODate("1988-05-22"),
		"locations": [
			"Bellaire", "Sugarland", "Houston"
		]
	},
	{
		"_id": 4,
		"name": "Administration",
		"manager_emp_id": "987654321",
		"manager_start_date": ISODate("1995-01-01"),
		"locations": [
			"Stafford"
		]
	},
	{
		"_id": 1,
		"name": "Headquarters",
		"manager_emp_id": "888665555",
		"manager_start_date": ISODate("1981-06-19"),
		"locations": [
			"Houston"
		]
	}
])