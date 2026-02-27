from abc import ABC, abstractmethod
from typing import List
from app.models.job import CollectedJob, JobFilter

class BaseCollector(ABC):
    @abstractmethod
    async def collect(self, query: JobFilter) -> List[CollectedJob]:
        """Collects jobs based on filter criteria"""
        pass
