import asyncio
from typing import List, Optional
from aredis_om import Field, JsonModel
from aredis_om.model import Migrator

from utils import Base


class Course(Base("courses"), JsonModel):
    name: str
    instructors: Optional[List[str]] = Field(index=True)


class Instructor(Base("instructors"), JsonModel):
    name: str = Field(index=True)
    courses: Optional[List[str]] = Field(index=True)


class Student(Base("students"), JsonModel):
    name: str = Field(index=True)
    courses: Optional[List[str]] = Field(index=True)


class Shout(Base("shouts"), JsonModel):
    message: str
    student_id: str = Field(index=True)

class Like(Base("likes"), JsonModel):
    student_id: str = Field(index=True)
    shout_id: str = Field(index=True)


async def get_courses_with_instructor(instructor_pk: str):
    return await Course.find(Course.instructors << instructor_pk).all()


async def get_instructors_with_course(course_pk: str):
    return await Instructor.find(Instructor.courses << course_pk).all()


async def get_students_in_course(course_pk: str):
    return await Student.find(Student.courses << course_pk).all()


async def get_courses_for_student(student_pk: str):
    student = await Student.get(student_pk)

    return await Course.find(Course.pk << student.courses).all()


async def add_courses():
    courses = [
        Course(name="Full Stack Development"),
        Course(name="Databases"),
        Course(name="Frontend Fundamentals"),
        Course(name="Backend Fundamentals"),
    ]

    await asyncio.wait([asyncio.create_task(course.save()) for course in courses])

    return courses


async def add_instructors(courses: List[Course]):
    instructors = [
        Instructor(name="Alfred Timberlake",
                   courses=[
                       courses[0].pk,
                       courses[1].pk
                   ]),
        Instructor(name="Roderick Erickson",
                   courses=[
                       courses[1].pk
                   ]),
        Instructor(name="Ramona Bernard",
                   courses=[
                       courses[1].pk,
                       courses[2].pk
                   ]),
        Instructor(name="Jeremy Bernard",
                   courses=[
                       courses[2].pk,
                       courses[3].pk
                   ]),
        Instructor(name="Earlene Dobbs",
                   courses=[
                       courses[1].pk,
                       courses[2].pk,
                       courses[3].pk
                   ]),
    ]

    courses[0].instructors = [instructors[0].pk]
    courses[1].instructors = [instructors[0].pk, instructors[1].pk, instructors[2].pk, instructors[4].pk]
    courses[2].instructors = [instructors[2].pk, instructors[3].pk, instructors[4].pk]
    courses[3].instructors = [instructors[3].pk, instructors[4].pk]

    await asyncio.wait([asyncio.create_task(instructor.save()) for instructor in instructors] + [asyncio.create_task(course.save()) for course in courses])

    return instructors


async def add_students(courses: List[Course]):
    students = [
        Student(name="Dustin Blakesley",
                courses=[
                    courses[0].pk,
                    courses[1].pk
                ]),
        Student(name="Mahala Shirley",
                courses=[
                    courses[1].pk
                ]),
        Student(name="Heath Haynes",
                courses=[
                    courses[1].pk,
                    courses[2].pk
                ]),
        Student(name="Delora Combs",
                courses=[
                    courses[2].pk,
                    courses[3].pk
                ]),
        Student(name="Cara Wilkie",
                courses=[
                    courses[0].pk,
                    courses[1].pk,
                    courses[2].pk,
                    courses[3].pk
                ]),
    ]

    await asyncio.wait([asyncio.create_task(student.save()) for student in students])

    return students


async def main():
    await Migrator().run()
    courses = await add_courses()
    await add_instructors(courses)
    await add_students(courses)

    print(await get_courses_with_instructor("1"))
    print(await get_instructors_with_course("1"))
    print(await get_students_in_course("1"))
    print(await get_courses_for_student("1"))

if __name__ == '__main__':
    asyncio.run(main())
