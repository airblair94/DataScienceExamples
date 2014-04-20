import numpy as np
import get_data as gd

"""
This file is going to be used to clean my data set, so that I get rid of
missing values and then puts it in a new cvs named "clean_communities.csv".
The functions in here can be continually improved and worked on as I want
to increase the complexity of my cleaning.

At this point, it is just replacing missing values with the average for the group.
I will also remove columns who have a r squared value of greater than .98, so 
I do not have any duplicates of columns.

The functions of this are:
    -replace missing values
    -get rid of duplicate columns
"""

# pass a column of data and replaces the missing data entries
# this only works for numerical data
def replace_missing(col):
    final = []
    col = col_to_float(col)
    avg = average_available_values(col)
    for x in col:
	if x == 123456789:
	    final.append(avg)
	else:
	    final.append(x)
    return final

def col_to_float(col):
    final = []
    for entry in col:
	if entry == "?":
	    final.append(123456789)
	else:
	    try:
		final.append(float(entry))
	    except:
		final.append(123456789)
    return final

def find_r(col1, col2):
    col1 = col_to_float(col1)
    col2 = col_to_float(col2)
    
    x = np.array(col1)
    y = np.array(col2)

    A = np.vstack([x, np.ones(len(x))]).T
    soln = np.linalg.lstsq(A,y)
    residual= soln[1]
    r = 1 - residual/(y.size * y.var())
   
    return r

def exist_same_pair(list_of_pairs, x, y):
    for i in list_of_pairs:
	if (i[0] == x or i[1] == x) and  (i[0] == y or i[1] == y):
	    return True
    return False

def replace_missing_data(rows_list_of, headers):
    final = []
    
    for x in range(len(rows_list_of)):
	final.append([])

    for y in range(len(headers)):
	col = get_col_from_list_of_lists(rows_list_of, y)
	newCol = replace_missing(col)
	for entry in newCol:
	    final[y].append(entry)
    
    return final

"""
The below three functions are really the only main ones that I need
"""
def get_headers_without_cols(cols_to_exclude):
    headers = gd.get_headers()
    final = []
    for x in range(len(headers)):
	if not x in cols_to_exclude:
	    final.append(headers[x])
    
    return final


def average_available_values(col):
    total = 0
    counter = 0
    
    for entry in col:
	if not entry == "":
	    total = total + float(entry)
	    counter = counter + 1
    final = 0
    if not counter == 0:
	final = total/counter
    
    return "%.2f" % final

def create_rows_list_of_lists_without_cols(list_of_dicts, cols_to_exclude):
    headers = gd.get_headers()
    final = []
    for x in range(len(list_of_dicts)):
	final.append([])

    counter = 0
    for x in range(len(headers)):
	if not x in cols_to_exclude: 
	    col = gd.get_data_slice(headers[x], list_of_dicts)
	    avg = average_available_values(col)
	    cleanedCol = gd.get_data_slice_replace(headers[x], list_of_dicts, avg)
	    counter = 0
	    for entry in cleanedCol:
		final[counter].append(entry)
		counter += 1
    
    return final
"""
Below are the functions specific to my data set.
"""

def find_nonNumeric_cols(list_of_dicts):
    final = []
    headers = gd.get_headers()
    for x in range(len(headers)):
	col = gd.get_data_slice(headers[x], list_of_dicts)
	isNumeric = True
	for entry in col:
	    try:
		float(entry)
	    except:
		if not (entry == ""):
		    isNumeric = False
	
	if not isNumeric:
	    final.append(x)

    return final


"""
Below creates the csv for the numbers.csv for my thermodata
filename = "my_numbers.csv"
headers = gd.get_headers()
list_of_dicts = gd.get_data_list_of_dicts()
cols_non_numeric = find_nonNumeric_cols(list_of_dicts)
rows_list_of_lists = [[]]
final_headers = []

for entry in range(len(headers)):
    if not entry in cols_non_numeric:
	final_headers.append(headers[entry])
	rows_list_of_lists[0].append("numeric form")


gd.write_data(filename, final_headers, rows_list_of_lists)
"""
"""
Below creates the csv for the categories.csv for my thermodata
filename = "categories.csv"
rows_list_of_lists = []
temp_rows_list_of_lists = []


for y in range(len(cols_non_numeric)):
    temp_rows_list_of_lists.append([])

print len(temp_rows_list_of_lists)
fin_headers = []
counter = 0
for x in range(len(headers)):
    if x in cols_non_numeric:
	fin_headers.append(headers[x])
	col = gd.get_data_slice(headers[x], list_of_dicts)
	for entry in col:
	    if not entry in temp_rows_list_of_lists[counter]:
		temp_rows_list_of_lists[counter].append(entry)
	counter = counter + 1

print temp_rows_list_of_lists[0]
temp_greatest = 0
for lst in temp_rows_list_of_lists:
    if (len(lst) > temp_greatest):
	temp_greatest = len(lst)

for z in range(temp_greatest):
    rows_list_of_lists.append([])

for a in range(len(temp_rows_list_of_lists)):
    for b in range(temp_greatest):
	try:
	    rows_list_of_lists[b].append(temp_rows_list_of_lists[a][b])
	except:
	    rows_list_of_lists[b].append("")

gd.write_data(filename, fin_headers, rows_list_of_lists)
"""
"""
I'm commenting out the part that made the cleaned.csv, so that I am not constantly remaking it

"""


#remove_dup_cols()
list_of_dicts = gd.get_data_list_of_dicts()
filename = "cleaned.csv"
cols_to_exclude = find_nonNumeric_cols(list_of_dicts)
new_headers = get_headers_without_cols(cols_to_exclude)
rows_list_of_lists = create_rows_list_of_lists_without_cols(list_of_dicts, cols_to_exclude)

print new_headers
#gd.write_data(filename, new_headers, rows_list_of_lists)


