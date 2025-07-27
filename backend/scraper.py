import requests
from bs4 import BeautifulSoup
import sys
import json

def scrape_webpage(url):
    """
    Scrape a webpage and extract text from elements with specific classes
    Returns a dictionary with title and description
    """
    try:
        # Send GET request to the URL
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Parse the HTML content
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find elements with the specific classes
        title_class = "jsx-1698234921 title text-primary mb-0 long"
        description_class = "jsx-fcd70e50c8120a32 content-card pb-1 event-about-card"
        datetime_class = "jsx-3365490771 icon-container flex-center-center rounded overflow-hidden flex-shrink-0"
        
        title_elements = soup.find_all(class_=title_class)
        description_elements = soup.find_all(class_=description_class)
        datetime_elements = soup.find_all(class_=datetime_class)
        
        # Extract text content
        title = title_elements[0].get_text(strip=True) if title_elements else ""
        description = description_elements[0].get_text(strip=True) if description_elements else ""
        datetime = datetime_elements[0].get_text(strip=True) if datetime_elements else ""
        
        # Create result dictionary
        result = {
            "title": title,
            "description": description,
            "datetime": datetime
        }
        
        # Save as JSON file
        with open('event_data.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"Title: {title}")
        print(f"Description: {description}")
        print(f"Date/Time: {datetime}")
        print(f"Data saved to event_data.json")
        
        return result
        
    except requests.RequestException as e:
        print(f"Error fetching the webpage: {e}")
        return {"title": "", "description": "", "datetime": ""}
    except Exception as e:
        print(f"An error occurred: {e}")
        return {"title": "", "description": "", "datetime": ""}