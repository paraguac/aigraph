"""
Variable Names That Look Like AI Models - False Positive Test
This file has variable/function names that coincidentally match AI terms
but are NOT actually using AI models.
"""

class Claude:
    """A person named Claude - not the AI model"""
    def __init__(self, name):
        self.name = name
        self.role = "Software Engineer"
    
    def introduce(self):
        return f"Hi, I'm {self.name}"

class Gemini:
    """Gemini zodiac sign class - not the AI model"""
    def __init__(self, birth_date):
        self.sign = "Gemini"
        self.birth_date = birth_date
    
    def get_horoscope(self):
        return "Today is a good day for Geminis!"

def mistral_wind_speed():
    """Calculate mistral wind speed - not the AI model"""
    # Mistral is a strong, cold northwesterly wind in France
    return 40  # km/h

def llama_count():
    """Count llamas in a farm - not the AI model"""
    # Just counting actual llamas (the animal)
    llamas = ["larry", "luna", "leo"]
    return len(llamas)

def titan_database_size():
    """Get size of Titan database - not AWS Titan model"""
    # Titan is a database name, not AI
    return 1024  # MB

def palm_tree_height():
    """Measure palm tree height - not PaLM model"""
    # Measuring actual palm trees
    return 25  # meters

# Variable names that happen to match AI terms
claude = "Claude Smith"  # A person's name
gemini = {"sign": "zodiac"}  # Astrology
mistral = "wind_type"  # Weather term
llama = "animal_type"  # The actual animal
phi = 1.618  # Golden ratio, not Phi model
falcon = "bird_species"  # The bird, not Falcon LLM

# Function that doesn't use AI despite similar naming
def gpt_calculate(a, b):
    """GPT = General Purpose Tool, not GPT-4"""
    return a + b

def o1_optimization():
    """O1 optimization algorithm, not O1 model"""
    # This is O(1) time complexity, not OpenAI's O1
    return "constant_time"

if __name__ == "__main__":
    person = Claude("Claude")
    print(person.introduce())
    print(f"Mistral wind: {mistral_wind_speed()} km/h")
    print(f"Llamas: {llama_count()}")
