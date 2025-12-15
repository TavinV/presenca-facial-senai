from pydantic import BaseModel
from typing import List
import numpy as np

class StudentEmbedding(BaseModel):
    id: str
    facial: np.ndarray
    rooms: List[str]

    class Config:
        arbitrary_types_allowed = True
