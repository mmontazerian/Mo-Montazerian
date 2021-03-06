import pandas as pd
from pandas import Series
from os.path import join

FILEPATH_CSV = join('..', join('dataset', 'restaurants_info.csv'))
FILEPATH_JSON = join('..', join('dataset', 'restaurants_list.json'))

def clean_line(str):
    return str.replace(',', '').replace(';', ',')

def read_file_lines(filepath=FILEPATH_CSV):
    with open(filepath, 'r') as f:
        lines = f.read().splitlines()
    return lines

def write_correct_csv(corrected_lines, output_file='fixed_csv_info.csv'):
    with open(output_file, 'w') as csv_file:
        for line in corrected_lines:
            csv_file.write(line + '\n')
    return output_file

if __name__ == '__main__':
    # swap out semicolons for commas so that pandas can process as CSV
    corrected_lines = map(clean_line, read_file_lines(FILEPATH_CSV))
    output_file_name = write_correct_csv(corrected_lines)

    list_df = pd.read_csv(output_file_name)
    json_df = pd.read_json(FILEPATH_JSON)

    # merge data frames on objectID and write to json file
    # this json file will be uploaded and indexed by Algolia
    merged = pd.merge(list_df, json_df, on="objectID")

    # normalize star counts
    normalized = map(int, merged['stars_count'])
    merged['normalized_star_count'] = Series(normalized, index=merged.index)

    with open('merged_restaurant_list.json', 'w') as f:
         json_data = merged.to_json(orient='records')
         f.write(json_data)
