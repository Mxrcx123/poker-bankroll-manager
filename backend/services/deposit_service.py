#Überarbeitet von Andreas Haas
from crud.deposit_crud import DepositCrud
from schema.deposit_schema import DepositCreate, DepositUpdate

def create(db, data: DepositCreate):
    if data.amount <= 0:
        raise ValueError("Amount must be greater than 0")
    return DepositCrud.create_deposit(db, data)

def get_all_by_user(db, user_id: int):
    return DepositCrud.get_deposits_by_user(db, user_id)

def get_one(db, deposit_id: int):
    return DepositCrud.get_deposit(db, deposit_id)

def update(db, deposit_id: int, data: DepositUpdate):
    return DepositCrud.update_deposit(db, deposit_id, data)

def delete(db, deposit_id: int):
    return DepositCrud.delete_deposit(db, deposit_id)