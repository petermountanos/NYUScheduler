import cherrypy, pymongo, cgi, random,string, bson
from bson.json_util import dumps

cherrypy.server.socket_host = '0.0.0.0'
cherrypy.server.socket_port = 7001

class NYUScheduler(object):

	def __init__(self):
		self.client = pymongo.MongoClient('127.0.0.1',7000)
		self.db     = self.client['albert']

	@cherrypy.expose
	def index(self):
		return "NYUScheduler Object"

	@cherrypy.expose
	def generate(self, length=8):
		return ''.join(random.sample(string.hexdigits,int(length)))

	@cherrypy.expose
	def getCourses(self, dept=None, course_no=None):

		if dept is not None and course_no is not None:
			q = self.db.courses.find({"classification":dept, "number":course_no}).sort([("course_name", pymongo.ASCENDING), ("section", pymongo.ASCENDING)])
		elif dept is not None:
		 	q = self.db.courses.find({"classification" : dept}).sort([("course_name", pymongo.ASCENDING), ("section", pymongo.ASCENDING)])
		else:
			q = self.db.courses.find().sort([("course_name", pymongo.ASCENDING), ("section", pymongo.ASCENDING)])

		return self._returnJSON(q)

	@cherrypy.expose
	def getColleges(self):
		q = self.db.colleges.find()
		return self._returnJSON(q)

	@cherrypy.expose
	def getDepts(self, college=None):
		if college is not None:
			q = self.db.departments.find({"college" : college}).sort("department_name", pymongo.ASCENDING)
		else:
			q = self.db.departments.find().sort("department_name", pymongo.ASCENDING)

		return self._returnJSON(q)

	@cherrypy.expose
	def getCart(self):
		q = self.db.schedules.find()
		s = ""
		q2 = self.db.courses.find({"_id" : {"$in": q[0]["courses"]}}).sort([("course_name", pymongo.ASCENDING), ("section", pymongo.ASCENDING)])

		return self._returnJSON(q2)

	@cherrypy.expose
	def addCourses(self, courses):
		if courses != "[]":
			courses_arr = courses[1:len(courses)-1].split(",")
			for c in courses_arr:
				self.db.schedules.update({"username": "pdm"},{'$push' : {"courses" : bson.objectid.ObjectId(c)}})
		else:
			courses_arr = []
		return self._returnJSON('{"num":"'+ str(len(courses_arr)) +'"}')

	@cherrypy.expose
	def removeCourses(self, courses=None):
		if courses is None:
			try:
				self.db.schedules.update({"username": "pdm"},{'$pop' : {"courses" : -1}})
			except:
				pass
			return self._returnJSON('{"num":"1"}')

		else:
			courses_arr = courses[1:len(courses)-1].split(",")
			for c in courses_arr:
				try:
					self.db.schedules.update({"username": "pdm"},{'$pop' : {"courses" : bson.objectid.ObjectId(c)}})
				except:
					pass
			
			return self._returnJSON('{"num":"'+ str(len(courses_arr)) +'"}')

	def _returnJSON(self, mongoQuery):
		json_q = dumps(mongoQuery)
		cherrypy.response.body = json_q
		cherrypy.response.headers["Access-Control-Allow-Origin"] = "http://websys3.stern.nyu.edu"
		cherrypy.response.headers["Content-Type"] = "application/json"
		return json_q

if __name__ == '__main__':
	cherrypy.quickstart(NYUScheduler())
