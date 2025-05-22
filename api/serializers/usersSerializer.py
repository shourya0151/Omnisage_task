def createUserSerializer(created_user) -> dict:
    return {
        "id": str(created_user["_id"]),
        "username": created_user["username"],
        "email": created_user["email"]
    }